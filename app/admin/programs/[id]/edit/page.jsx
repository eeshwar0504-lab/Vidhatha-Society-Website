"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ToastProvider";

import { EditorContent, useEditor } from "@tiptap/react";
import * as StarterKitPkg from "@tiptap/starter-kit";
import * as HistoryPkg from "@tiptap/extension-history";
import * as LinkExtensionPkg from "@tiptap/extension-link";
import * as UnderlinePkg from "@tiptap/extension-underline";
import * as ImageExtensionPkg from "@tiptap/extension-image";

/* ---------- Constants ---------- */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/* ---------- Helper (same as Create page) ---------- */
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

/* ---------- LinkModal & Toolbar (same as Create) ---------- */
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

  const active = (name, opts) => (editor.isActive(name, opts) ? "bg-white/10" : "");

  return (
    <>
      <div className="sticky top-4 z-30 bg-black/40 backdrop-blur-sm p-2 rounded-md shadow-sm flex gap-2 flex-wrap items-center">
        <button aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 rounded ${active("bold")}`}>B</button>
        <button aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 rounded ${active("italic")}`}><em>I</em></button>
        <button aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-3 py-1 rounded ${active("underline")}`}><u>U</u></button>

        <button aria-label="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-3 py-1 rounded ${active("heading", { level: 1 })}`}>H1</button>
        <button aria-label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 rounded ${active("heading", { level: 2 })}`}>H2</button>

        <button aria-label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1 rounded ${active("bulletList")}`}>• List</button>
        <button aria-label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-3 py-1 rounded ${active("orderedList")}`}>1. List</button>

        <button aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} className="px-3 py-1 rounded">Undo</button>
        <button aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} className="px-3 py-1 rounded">Redo</button>

        <button aria-label="Insert link" onClick={() => setLinkModalOpen(true)} className="px-3 py-1 rounded">Link</button>

        <button aria-label="Insert image" onClick={() => handleAddImage()} className="px-3 py-1 rounded">Image</button>
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

/* ---------- Edit Page Component ---------- */
export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("education");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const [fetchedDescription, setFetchedDescription] = useState(null);

  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [localContent, setLocalContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const autosaveTimerRef = useRef(null);
  const isManualSaveRef = useRef(false);

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

  /* ---------- Fetch program ---------- */
  useEffect(() => {
    let mounted = true;
    if (!id) {
      setErr("Missing program id");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/programs/${id}`);
        const program = res?.data?.program || res?.data?.doc || res?.data || null;
        if (!program) throw new Error("Program not found");

        if (!mounted) return;

        setTitle(program.title || "");
        setCategory(program.category || "education");
        setShortDescription(program.short || program.shortDescription || program.excerpt || "");
        const img = program.imageUrl || (program.images && program.images[0]) || null;
        setImageUrl(img || null);
        if (img) setPreviewUrl(img);

        const desc = program.description ?? program.content ?? program.body ?? "";
        setFetchedDescription(desc || "");
      } catch (e) {
        console.error(e);
        if (mounted) {
          setErr(e?.response?.data?.message || e?.message || "Failed to load program");
          toast.error(e?.response?.data?.message || e?.message || "Failed to load program");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  /* ---------- Apply fetched description ---------- */
  useEffect(() => {
    if (!editor || fetchedDescription == null) return;
    try {
      if (typeof fetchedDescription === "object") {
        editor.commands.setContent(fetchedDescription);
        setLocalContent(editor.getHTML());
      } else {
        if (typeof fetchedDescription === "string" && fetchedDescription.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(fetchedDescription);
            editor.commands.setContent(parsed);
          } catch {
            editor.commands.setContent(fetchedDescription);
          }
        } else {
          editor.commands.setContent(fetchedDescription);
        }
        setTimeout(() => {
          try { setLocalContent(editor.getHTML()); } catch { setLocalContent(fetchedDescription || ""); }
        }, 50);
      }
    } catch (err) {
      console.error("Failed to set editor content:", err);
      try { editor.commands.setContent(fetchedDescription); } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, fetchedDescription]);

  /* ---------- Editor update & autosave ---------- */
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => {
      const html = editor.getHTML();
      setLocalContent(html);

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      if (!autosaveEnabled || saving || imageUploading) return;

      autosaveTimerRef.current = setTimeout(async () => {
        if (isManualSaveRef.current) {
          isManualSaveRef.current = false;
          return;
        }
        try {
          setSaving(true);
          const payload = { title, category, shortDescription, description: html, imageUrl };
          await api.put(`/api/programs/${id}`, payload, { headers: { "Content-Type": "application/json" } });
          setLastSavedAt(new Date());
        } catch (err) {
          console.error("Autosave failed:", err);
          toast.error("Autosave failed (network). Changes saved locally.");
        } finally {
          setSaving(false);
        }
      }, 2000);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [editor, autosaveEnabled, saving, imageUploading, title, category, shortDescription, imageUrl, id]);

  /* ---------- Revoke blob URLs ---------- */
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
    try {
      setImageUploading(true);
      setImageUploadProgress(0);
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/api/uploads/single", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          try {
            const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
            setImageUploadProgress(pct);
          } catch {}
        },
      });
      const url =
        res?.data?.url ||
        res?.data?.secure_url ||
        res?.data?.data?.url ||
        res?.data?.result?.secure_url ||
        res?.data?.file?.secure_url ||
        null;
      setImageUploadProgress(0);
      if (!url) toast.error("Upload returned unexpected response");
      return url;
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed");
      setImageUploadProgress(0);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  /* ---------- Main image selection ---------- */
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

  /* ---------- Save handler ---------- */
  const onSave = async (e) => {
    e?.preventDefault();
    if (!id) {
      setErr("Missing program id");
      toast.error("Missing program id");
      return;
    }

    isManualSaveRef.current = true;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setSaving(true);
    setErr(null);

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploaded = await uploadImageToServer(imageFile);
        if (!uploaded) throw new Error("Image upload failed");
        finalImageUrl = uploaded;
      }
      const descriptionHtml = editor ? editor.getHTML() : localContent || "";
      const payload = { title, category, shortDescription, description: descriptionHtml, imageUrl: finalImageUrl };
      const res = await api.put(`/api/programs/${id}`, payload, { headers: { "Content-Type": "application/json" } });
      const ok = !!res && (Boolean(res?.data?.program) || Boolean(res?.data?.doc) || Boolean(res?.data?.updated) || res.status === 200);
      if (!ok) {
        console.warn("Unexpected update response:", res?.data);
        throw new Error("Unexpected server response");
      }
      setLastSavedAt(new Date());
      toast.success("Program saved");
      router.push("/admin/programs");
    } catch (error) {
      console.error("Save failed", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to update program";
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-40 bg-gray-100 rounded animate-pulse" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Edit Program</h1>

        {err && <div className="mb-4 text-red-600">{err}</div>}

        <form onSubmit={onSave} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input type="text" className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block mb-1 font-medium">Category *</label>
            <select className="w-full border p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="awareness">Awareness</option>
              <option value="environment">Environment</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Short Description *</label>
            <input type="text" className="w-full border p-2 rounded" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-medium">Detailed Description</label>

              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={autosaveEnabled} onChange={(e) => setAutosaveEnabled(e.target.checked)} /><span>Autosave</span></label>
                <button type="button" onClick={() => setPreviewVisible((v) => !v)} className="px-2 py-1 border rounded">{previewVisible ? "Hide Preview" : "Show Preview"}</button>
                <div className="text-gray-500">{saving ? "Saving..." : lastSavedAt ? `Saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}` : "Not saved yet"}</div>
              </div>
            </div>

            <div className="mb-2"><Toolbar editor={editor} onImageUpload={uploadImageToServer} /></div>

            <div className="border rounded p-3 bg-white min-h-[220px]">
              {editor ? <EditorContent editor={editor} className="prose prose-invert max-w-none" /> : <div>Loading editor...</div>}
            </div>

            {previewVisible && <div className="mt-4 border rounded p-4 bg-gray-50 prose max-w-none"><div dangerouslySetInnerHTML={{ __html: localContent || (editor ? editor.getHTML() : "") }} /></div>}
          </div>

          <div>
            <label className="block mb-2 font-medium">Program Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMainImageChange} />
            <div className="mt-3">{previewUrl ? <img src={previewUrl} alt="preview" className="max-h-48 rounded border" /> : <div className="text-sm text-gray-500">No image selected</div>}</div>

            {imageUploading && <div className="mt-2">
              <div className="text-sm text-gray-600">Uploading: {imageUploadProgress}%</div>
              <div className="h-2 bg-gray-200 rounded overflow-hidden mt-1"><div style={{ width: `${imageUploadProgress}%` }} className="h-full bg-blue-600" /></div>
            </div>}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving || imageUploading} className={`px-4 py-2 rounded text-white ${saving || imageUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}`}>{saving ? "Saving..." : imageUploading ? "Uploading image..." : "Save Changes"}</button>
            <button type="button" onClick={() => router.push("/admin/programs")} className="px-4 py-2 border rounded">Cancel</button>
            {imageUploading && <div className="text-sm text-gray-500">Image upload in progress...</div>}
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
