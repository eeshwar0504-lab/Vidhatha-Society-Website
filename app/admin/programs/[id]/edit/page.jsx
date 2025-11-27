"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ToastProvider";

import { EditorContent, useEditor } from "@tiptap/react";
import * as StarterKitPkg from "@tiptap/starter-kit";
import * as HistoryPkg from "@tiptap/extension-history";
import * as LinkExtensionPkg from "@tiptap/extension-link";
import * as UnderlinePkg from "@tiptap/extension-underline";
import * as ImageExtensionPkg from "@tiptap/extension-image";

/* ---------- Constants ---------- */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const EDIT_TEST_FILE = "/mnt/data/87fda3cf-c54a-4bf6-852d-8b2e27b20f76.png";

/* ---------- Helper to safely create extensions ---------- */
function makeExt(mod) {
  if (!mod) return null;
  const m = mod.default ?? mod;
  if (typeof m === "function") {
    try {
      return m();
    } catch {}
  }
  return m;
}

/* ---------- Small Link modal used by toolbar ---------- */
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
          className="w-full border p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:brightness-105 transition"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Toolbar (compact, styled) ---------- */
function Toolbar({ editor, onImageUpload }) {
  if (!editor) return null;
  const [linkModalOpen, setLinkModalOpen] = useState(false);

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

  const active = (name, opts) => (editor.isActive(name, opts) ? "ring-2 ring-indigo-200 bg-indigo-50" : "");

  const btn = `px-3 py-1 rounded-md text-sm border bg-white/60 hover:scale-[1.03] transition transform`;

  return (
    <>
      <div className="sticky top-4 z-30 bg-white/70 backdrop-blur-sm p-2 rounded-md shadow-sm flex gap-2 flex-wrap items-center">
        <button aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btn} ${active("bold")}`}>B</button>
        <button aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btn} ${active("italic")}`}><em>I</em></button>
        <button aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btn} ${active("underline")}`}><u>U</u></button>

        <button aria-label="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btn} ${active("heading", { level: 1 })}`}>H1</button>
        <button aria-label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btn} ${active("heading", { level: 2 })}`}>H2</button>

        <button aria-label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btn} ${active("bulletList")}`}>• List</button>
        <button aria-label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btn} ${active("orderedList")}`}>1. List</button>

        <button aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} className={`${btn}`}>Undo</button>
        <button aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} className={`${btn}`}>Redo</button>

        <button aria-label="Insert link" onClick={() => setLinkModalOpen(true)} className={`${btn}`}>Link</button>

        <button aria-label="Insert image" onClick={() => handleAddImage()} className={`${btn}`}>Image</button>
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

/* ---------- Edit Program Page (prefills data + update) ---------- */
export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || params?.programId || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("social-welfare");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [publicId, setPublicId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const [localContent, setLocalContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const editor = useEditor({
    extensions: [
      makeExt(StarterKitPkg),
      makeExt(HistoryPkg),
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

  // load program
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/programs/${encodeURIComponent(id)}`);
        const doc = res?.data?.program || res?.data?.doc || res?.data || null;
        if (!doc) {
          throw new Error("Program not found");
        }
        if (cancelled) return;
        setTitle(doc.title || "");
        setCategory(doc.category || "social-welfare");
        setShortDescription(doc.short || "");
        setImageUrl(doc.imageUrl || (doc.images && doc.images[0]) || null);
        setPublicId(doc.publicId || doc.public_id || null);
        if (doc.description) {
          try {
            editor && editor.commands && editor.commands.setContent && editor.commands.setContent(doc.description);
            setLocalContent(doc.description);
          } catch {}
        }
      } catch (e) {
        console.error("Failed to load program", e);
        toast.error("Failed to load program. It may not exist or there was a network error.");
        setErr(e?.message || "Failed to load program");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, editor]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => setLocalContent(editor.getHTML());
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

  /* ---------- Upload helper (same approach as Create) ---------- */
  // Replace your uploadImageToServer with this version
// Works in Next.js client components (JS). If you use TS, add types accordingly.

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

  setImageUploading(true);
  setImageUploadProgress(0);

  // helper: do a single POST to given endpoint and field name
  const tryServerUpload = async (endpoint, fieldName = "file") => {
    try {
      const fd = new FormData();
      fd.append(fieldName, file, file.name);

      // Important: don't set Content-Type header for FormData; axios will set boundary
      // If you use fetch remove Content-Type too.
      const res = await api.post(endpoint, fd, {
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          try {
            const loaded = progressEvent?.loaded ?? 0;
            const total = progressEvent?.total ?? file.size ?? 0;
            const pct = total ? Math.round((loaded * 100) / total) : 0;
            setImageUploadProgress(pct);
          } catch {}
        },
        // withCredentials: false, // only if needed for cookies
      });

      const data = res?.data ?? {};
      // server might return url under different keys
      const url = data.url || data.fileUrl || data.path || data.location || (data.result && data.result.secure_url) || null;
      if (url) {
        console.info(`[upload] server upload succeeded: ${endpoint}`, url);
        return url;
      }

      // not error but no url -> treat as failure
      console.warn(`[upload] server returned no url for ${endpoint}`, data);
      return null;
    } catch (err) {
      console.warn(`[upload] server upload to ${endpoint} failed:`, err?.response?.data ?? err?.message ?? err);
      return null;
    }
  };

  try {
    // 1) try main endpoint (/api/uploads) with "file"
    let url = await tryServerUpload("/api/uploads", "file");
    if (url) {
      setImageUploadProgress(0);
      return url;
    }

    // 2) fallback: /api/uploads/single with "image"
    url = await tryServerUpload("/api/uploads/single", "image");
    if (url) {
      setImageUploadProgress(0);
      return url;
    }

    // 3) fallback: try direct unsigned Cloudinary (if env present)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const unsignedPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;
    if (cloudName && unsignedPreset) {
      try {
        const unsignedUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
        const fd2 = new FormData();
        fd2.append("file", file);
        fd2.append("upload_preset", unsignedPreset);
        // If you want to place into folder, you must include it in unsigned preset or supply 'folder' if preset allows.
        const resp = await fetch(unsignedUrl, { method: "POST", body: fd2 });
        if (!resp.ok) {
          const text = await resp.text();
          console.warn("[upload] unsigned cloudinary failed:", resp.status, text);
          throw new Error("Unsigned Cloudinary upload failed");
        }
        const json = await resp.json();
        const secure = json.secure_url || json.url || null;
        if (secure) {
          console.info("[upload] unsigned cloudinary succeeded", secure);
          setImageUploadProgress(0);
          return secure;
        }
        console.warn("[upload] unsigned cloudinary returned no secure_url", json);
      } catch (e) {
        console.warn("[upload] unsigned cloudinary error:", e);
      }
    } else {
      console.info("[upload] no unsigned cloudinary config (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET)");
    }

    // nothing worked
    toast.error("Image upload failed. Check server logs and Cloudinary config.");
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

  /* ---------- Save (update) handler ---------- */
  const onSave = async (e) => {
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
    if (!id) {
      toast.error("Missing program id");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      let finalPublicId = publicId;
      if (imageFile) {
        const uploaded = await uploadImageToServer(imageFile);
        if (!uploaded) {
          const msg = "Image upload failed — program not updated.";
          setErr(msg);
          toast.error(msg);
          setSaving(false);
          return;
        }
        finalImageUrl = uploaded;
      }

      const descriptionHtml = editor ? editor.getHTML() : localContent || "";

      const payload = { title, category, short: shortDescription, description: descriptionHtml, imageUrl: finalImageUrl, publicId: finalPublicId };

      const res = await api.put(`/api/programs/${encodeURIComponent(id)}`, payload, { headers: { "Content-Type": "application/json" } });
      const updated = res?.data?.program || res?.data?.doc || res?.data || null;
      if (!updated) {
        console.warn("Unexpected update response:", res?.data);
        throw new Error("Unexpected server response");
      }
      toast.success("Program updated");
      router.push("/admin/programs");
    } catch (error) {
      console.error("Update failed", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to update program";
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Optional: remove current image (ask backend to delete if publicId present) ---------- */
  const handleRemoveImage = async () => {
    if (!imageUrl && !publicId) {
      setImageUrl(null);
      setPublicId(null);
      setPreviewUrl(null);
      setImageFile(null);
      return;
    }
    if (!id) return;
    try {
      // Call your backend endpoint to remove image by publicId or by saving null imageUrl.
      // This endpoint is optional; if not present, we simply clear the UI and let admin save.
      if (publicId) {
        await api.post(`/api/uploads/delete`, { publicId }); // implement server-side if desired
      }
    } catch (e) {
      // ignore deletion error but inform user
      console.warn("Image deletion request failed", e);
      toast.info("Could not delete remote image; it will be removed from program record.");
    } finally {
      setImageUrl(null);
      setPublicId(null);
      setPreviewUrl(null);
      setImageFile(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Program</h1>
            <p className="text-sm text-gray-600 mt-1">Edit the program details, update the image and save changes.</p>
          </div>

          <div className="flex items-center gap-3">
            <a href={EDIT_TEST_FILE} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">Reference file</a>
            <button
              onClick={() => router.push("/admin/programs")}
              className="px-3 py-2 rounded-md border hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || imageUploading}
              className={`px-4 py-2 rounded-md text-white shadow ${saving || imageUploading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-500 hover:scale-[1.02] transform transition"}`}
            >
              {saving ? "Saving..." : imageUploading ? "Uploading image..." : "Save Changes"}
            </button>
          </div>
        </div>

        {err && <div className="mb-4 text-red-600 rounded p-3 bg-red-50 border border-red-100">{err}</div>}

        <form onSubmit={onSave} className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Title *</label>
              <input type="text" className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none transition" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="block mb-1 font-medium">Category *</label>
              <select className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="social-welfare">Social Welfare & Humanitarian aid</option>
                <option value="awareness-education">Awareness & Education</option>
                <option value="health-wellbeing">Health & Well-Being</option>
                <option value="senior-special-support">Senior & Special Support</option>
                <option value="women-youth-child">Women, Youth & Child Empowerment</option>
                <option value="community-rural-development">Community & Rural Development</option>
                <option value="celebration-cultural-integration">Celebration & Cultural Integration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Short Description *</label>
            <input type="text" className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-medium">Detailed Description</label>
              <div className="text-sm text-gray-600">Tip: use the toolbar to format content & insert images.</div>
            </div>

            <div className="mb-2">
              <Toolbar editor={editor} onImageUpload={uploadImageToServer} />
            </div>

            <div className="border rounded p-3 bg-white min-h-[240px] shadow-sm">
              {editor ? <EditorContent editor={editor} className="prose max-w-none" /> : <div className="text-gray-500">Loading editor...</div>}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" onChange={(e) => setPreviewVisible(e.target.checked)} />
                <span>Show preview below</span>
              </label>
            </div>

            {previewVisible && <div className="mt-4 border rounded p-4 bg-gray-50 prose max-w-none"><div dangerouslySetInnerHTML={{ __html: localContent || (editor ? editor.getHTML() : "") }} /></div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Program Image</label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMainImageChange} className="text-sm" />
                <div className="text-sm text-gray-500">JPG/PNG up to 5MB</div>
              </div>

              <div className="mt-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="max-h-44 rounded border shadow-sm object-cover" />
                ) : imageUrl ? (
                  <img src={imageUrl} alt="current" className="max-h-44 rounded border shadow-sm object-cover" />
                ) : (
                  <div className="h-44 rounded border flex items-center justify-center text-gray-400 bg-gray-50">No image selected</div>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => { setPreviewUrl(null); setImageFile(null); }} className="px-3 py-1 border rounded text-sm">Clear Local</button>
                <button type="button" onClick={handleRemoveImage} className="px-3 py-1 border rounded text-sm">Remove Image</button>
              </div>

              {imageUploading && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-1">Uploading: {imageUploadProgress}%</div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div style={{ width: `${imageUploadProgress}%` }} className="h-full bg-indigo-500 transition-all" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-md border p-3 bg-amber-50 text-sm shadow-sm">
                <div className="font-semibold">Quick Info</div>
                <div className="text-xs text-gray-600 mt-1">You can replace or remove the program image here.</div>
              </div>

              <div className="rounded-md border p-3 bg-white shadow-sm text-sm">
                <div className="text-sm font-medium mb-2">Actions</div>
                <button
                  type="button"
                  onClick={() => {
                    setTitle("Sample Program Title");
                    setShortDescription("A short summary to help you begin quickly.");
                    if (editor) editor.commands.setContent("<p>Start writing your program details here...</p>");
                    toast.info("Sample content inserted");
                  }}
                  className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50 transition"
                >
                  Insert Sample
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => router.push("/admin/programs")} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition">Cancel</button>

            <button
              type="submit"
              disabled={saving || imageUploading}
              className={`px-4 py-2 rounded-md text-white shadow-sm ${saving || imageUploading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-500 hover:scale-[1.02] transform transition"}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
