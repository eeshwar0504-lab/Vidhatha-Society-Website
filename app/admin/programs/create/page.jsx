// app/admin/programs/create/page.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ToastProvider";

import { EditorContent, useEditor } from "@tiptap/react";
import * as StarterKitPkg from "@tiptap/starter-kit";
import * as LinkExtensionPkg from "@tiptap/extension-link";
import * as UnderlinePkg from "@tiptap/extension-underline";
import * as ImageExtensionPkg from "@tiptap/extension-image";

/* ---------- Constants ---------- */
// local file provided in project assets (use this exact path)
const PROJECT_SUMMARY_PDF = "/mnt/data/Vidhatha_Society_A_to_Z_Summary.pdf";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/* ---------- Helpers ---------- */
function makeExt(mod) {
  if (!mod) return null;
  const m = mod.default ?? mod;
  if (typeof m === "function") {
    try {
      return m();
    } catch (e) {
      // ignore
    }
  }
  return m;
}

/* ---------- Link Modal ---------- */
function LinkModal({ open, onClose, onInsert, initialUrl = "", initialNewTab = true }) {
  const [url, setUrl] = useState(initialUrl || "");
  const [newTab, setNewTab] = useState(initialNewTab);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl || "");
      setNewTab(initialNewTab);
    }
  }, [open, initialUrl, initialNewTab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-4 z-60 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-medium mb-2">Insert Link</h3>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <label className="flex items-center gap-2 mb-3 text-sm">
          <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} />
          Open in new tab
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button
            onClick={() => {
              if (!url || !/^https?:\/\//i.test(url)) {
                toast.error("Please enter a valid URL starting with http:// or https://");
                return;
              }
              onInsert({ href: url, newTab });
            }}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Toolbar ---------- */
function Toolbar({ editor, onImageUpload }) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  if (!editor) return null;

  const handleAddImage = async (file) => {
    if (!file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const chosen = input.files?.[0];
        if (!chosen) return;
        const url = await onImageUpload(chosen);
        if (url) editor.chain().focus().setImage({ src: url }).run();
        else toast.error("Image upload failed");
      };
      input.click();
      return;
    }
    const url = await onImageUpload(file);
    if (url) editor.chain().focus().setImage({ src: url }).run();
    else toast.error("Image upload failed");
  };

  const isActive = (name, opts) => editor.isActive(name, opts);

  const btnBase = "px-3 py-1 rounded-md text-sm border bg-white/60 backdrop-blur-sm hover:scale-[1.02] transition";

  return (
    <>
      <div className="sticky top-4 z-30 p-2 rounded-md shadow-sm flex gap-2 flex-wrap items-center bg-white/70 backdrop-blur">
        <button aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnBase} ${isActive("bold") ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}>B</button>
        <button aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnBase} ${isActive("italic") ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}><em>I</em></button>
        <button aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnBase} ${isActive("underline") ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}><u>U</u></button>

        <button aria-label="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnBase} ${isActive("heading", { level: 1 }) ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}>H1</button>
        <button aria-label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnBase} ${isActive("heading", { level: 2 }) ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}>H2</button>

        <button aria-label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnBase} ${isActive("bulletList") ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}>• List</button>
        <button aria-label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnBase} ${isActive("orderedList") ? "ring-2 ring-indigo-300 bg-indigo-50" : ""}`}>1. List</button>

        <button aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} className={`${btnBase}`}>Undo</button>
        <button aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} className={`${btnBase}`}>Redo</button>

        <button aria-label="Insert link" onClick={() => setLinkModalOpen(true)} className={`${btnBase}`}>Link</button>

        <button aria-label="Insert image" onClick={() => handleAddImage()} className={`${btnBase}`}>Image</button>
      </div>

      <LinkModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onInsert={({ href, newTab }) => {
          editor.chain().focus().extendMarkRange("link").setLink({ href, target: newTab ? "_blank" : null, rel: newTab ? "noopener noreferrer" : null }).run();
          setLinkModalOpen(false);
        }}
      />
    </>
  );
}

/* ---------- Create Program Page ---------- */
export default function CreateProgramPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("social-welfare");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const [localContent, setLocalContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const editor = useEditor({
    extensions: [
      makeExt(StarterKitPkg),
      makeExt(UnderlinePkg),
      (function () {
        const m = LinkExtensionPkg.default ?? LinkExtensionPkg;
        if (m && typeof m.configure === "function") return m.configure({ openOnClick: true });
        return makeExt(m);
      })(),
      makeExt(ImageExtensionPkg),
    ].filter(Boolean),
    content: "",
    immediatelyRender: false,
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editor) {
      try {
        setLocalContent(editor.getHTML());
      } catch {}
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      setLocalContent(editor.getHTML());
    };
    editor.on("update", handler);
    return () => editor.off("update", handler);
  }, [editor]);

  useEffect(() => {
    return () => {
      try {
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      } catch {}
    };
  }, [previewUrl]);

  /* ---------- Upload helper ---------- */
  const uploadImageToServer = async (file) => {
    if (!file) return null;
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return null;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image too large. Max size is 5 MB.");
      return null;
    }

    const ENDPOINT = "/api/uploads";
    setImageUploading(true);
    setImageUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);

      const res = await api.post(ENDPOINT, fd, {
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          try {
            const loaded = progressEvent?.loaded ?? 0;
            const total = progressEvent?.total ?? file.size ?? 0;
            const pct = total ? Math.round((loaded * 100) / total) : 0;
            setImageUploadProgress(pct);
          } catch {}
        },
        withCredentials: false,
      });

      const data = res?.data ?? {};
      const url = data.url || data.fileUrl || data.path || data.location || null;

      if (!url) {
        console.error("Upload succeeded but server returned no URL:", data);
        toast.error("Upload succeeded but server returned no URL. Check server response.");
        return null;
      }

      setImageUploadProgress(0);
      return url;
    } catch (err) {
      console.error("Upload error details:", {
        message: err?.message,
        response: err?.response ? { status: err.response.status, data: err.response.data } : undefined,
        request: err?.request,
      });

      if (err?.response?.data) {
        const body = err.response.data;
        const serverMsg = body.message || body.error || JSON.stringify(body);
        toast.error(serverMsg || "Upload failed (server error)");
      } else if (err?.request) {
        toast.error("Network/CORS error: failed to contact upload server. Check backend is running and CORS allows this origin.");
      } else {
        toast.error(err?.message || "Image upload failed");
      }

      return null;
    } finally {
      setImageUploadProgress(0);
      setImageUploading(false);
    }
  };

  const handleMainImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type || !f.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (f.size > MAX_IMAGE_SIZE) {
      toast.error("Image too large. Max size is 5 MB.");
      return;
    }
    setImageFile(f);
    try {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    } catch {}
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onCreate = async (e) => {
    e?.preventDefault();
    setErr(null);
    if (!title || title.trim().length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (!shortDescription || shortDescription.trim().length < 10) {
      toast.error("Short description must be at least 10 characters.");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploaded = await uploadImageToServer(imageFile);
        if (!uploaded) {
          const msg = "Image upload failed — program not created.";
          setErr(msg);
          toast.error(msg);
          setSaving(false);
          return;
        }
        finalImageUrl = uploaded;
      }
      const descriptionHtml = editor ? editor.getHTML() : localContent || "";
      const payload = { title, category, short: shortDescription, description: descriptionHtml, imageUrl: finalImageUrl };
      const res = await api.post("/api/programs", payload, { headers: { "Content-Type": "application/json" } });
      const created = res?.data?.program || res?.data?.doc || res?.data || null;
      if (!created) {
        console.warn("Unexpected create response:", res?.data);
        throw new Error("Unexpected server response");
      }
      toast.success("Program created");
      router.push("/admin/programs");
    } catch (error) {
      console.error("Create failed", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to create program";
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Create Program</h1>
          <a href={PROJECT_SUMMARY_PDF} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Project Plan (PDF)</a>
        </div>

        {err && <div className="mb-4 text-red-600">{err}</div>}

        <form onSubmit={onCreate} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input type="text" className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block mb-1 font-medium">Category *</label>
            <select className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="social-welfare">Social Welfare &amp; Humanitarian aid</option>
              <option value="awareness-education">Awareness &amp; Education</option>
              <option value="health-wellbeing">Health &amp; Well-Being</option>
              <option value="senior-special-support">Senior &amp; Special Support</option>
              <option value="women-youth-child">Women, Youth &amp; Child Empowerment</option>
              <option value="community-rural-development">Community &amp; Rural Development</option>
              <option value="celebration-cultural-integration">Celebration &amp; Cultural Integration</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Short Description *</label>
            <input type="text" className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-medium">Detailed Description</label>
              <div className="flex items-center gap-3 text-sm">
                <button type="button" onClick={() => setPreviewVisible(v => !v)} className="px-2 py-1 border rounded-md hover:bg-gray-50 transition">{previewVisible ? "Hide Preview" : "Show Preview"}</button>
              </div>
            </div>

            <div className="mb-3">
              <Toolbar editor={editor} onImageUpload={uploadImageToServer} />
            </div>

            <div className="border rounded p-3 bg-white min-h-[220px]">
              {editor ? <EditorContent editor={editor} className="prose max-w-none" /> : <div>Loading editor...</div>}
            </div>

            {previewVisible && <div className="mt-4 border rounded p-4 bg-gray-50 prose max-w-none"><div dangerouslySetInnerHTML={{ __html: localContent || (editor ? editor.getHTML() : "") }} /></div>}
          </div>

          <div>
            <label className="block mb-2 font-medium">Program Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMainImageChange} className="text-sm" />
            <div className="mt-3">
              {previewUrl ? <img src={previewUrl} alt="preview" className="max-h-48 rounded border shadow-sm" /> : <div className="text-sm text-gray-500">No image selected</div>}
            </div>

            {imageUploading && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">Uploading: {imageUploadProgress}%</div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div style={{ width: `${imageUploadProgress}%` }} className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving || imageUploading} className={`px-4 py-2 rounded-md text-white shadow ${saving || imageUploading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-500 hover:scale-[1.02] transform transition"}`}>
              {saving ? "Creating..." : imageUploading ? "Uploading image..." : "Create Program"}
            </button>
            <button type="button" onClick={() => router.push("/admin/programs")} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition">Cancel</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
