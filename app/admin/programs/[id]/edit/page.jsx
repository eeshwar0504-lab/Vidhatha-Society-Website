"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatDistanceToNow } from "date-fns"; // friendly "saved 2m ago" label

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image";
import History from "@tiptap/extension-history";

/**
 * Full Edit Program page
 * - Autosave (debounced) with full PUT payload
 * - Manual save flag so autosave doesn't immediately re-run
 * - Preview toggle
 * - Image upload via /api/uploads/single
 * - Safe handling for various backend response shapes
 */

/* ------------------------- Toolbar Component ------------------------- */
function Toolbar({ editor, onImageUpload }) {
  if (!editor) return null;

  const handleAddImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await onImageUpload(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
        else alert("Image upload failed");
      } catch (err) {
        console.error("Image insert failed", err);
        alert("Image upload failed");
      }
    };
    input.click();
  };

  const active = (name, opts) => (editor.isActive(name, opts) ? "bg-white/10" : "");

  return (
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

      <button
        aria-label="Insert link"
        onClick={() => {
          const href = window.prompt("Enter the link URL (including https://)");
          if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }}
        className="px-3 py-1 rounded"
      >
        Link
      </button>

      <button aria-label="Insert image" onClick={handleAddImage} className="px-3 py-1 rounded">Image</button>
    </div>
  );
}

/* ------------------------- Edit Page ------------------------- */
export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // basic UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("education");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null); // existing image url in DB
  const [imageFile, setImageFile] = useState(null); // local File object chosen by user
  const [previewUrl, setPreviewUrl] = useState(null); // blob or existing url

  // upload state
  const [imageUploading, setImageUploading] = useState(false);

  // fetched description (set after fetch then applied to editor)
  const [fetchedDescription, setFetchedDescription] = useState(null);

  // autosave + preview states
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [localContent, setLocalContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const autosaveTimerRef = useRef(null);
  const isManualSaveRef = useRef(false);

  // editor init
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      History(),
      Underline,
      LinkExtension.configure({ openOnClick: true }),
      ImageExtension,
    ],
    content: "",
    immediatelyRender: false,
  });

  const fileInputRef = useRef(null);

  /* ---------- Fetch program on mount ---------- */
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
        // support different shapes
        const program = res?.data?.program || res?.data?.doc || res?.data || null;
        if (!program) throw new Error("Program not found");

        if (!mounted) return;

        setTitle(program.title || "");
        setCategory(program.category || "education");
        setShortDescription(program.short || program.shortDescription || program.excerpt || "");
        const img = program.imageUrl || (program.images && program.images[0]) || null;
        setImageUrl(img || null);
        if (img) setPreviewUrl(img);

        // Description body: accept `description`, `content`, or `body` (common variations)
        const desc = program.description ?? program.content ?? program.body ?? "";
        setFetchedDescription(desc || "");
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.response?.data?.message || e?.message || "Failed to load program");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ---------- Apply fetched description to editor when ready ---------- */
  useEffect(() => {
    if (!editor || fetchedDescription == null) return;
    try {
      // if fetchedDescription looks like JSON, try to parse; otherwise set HTML string
      if (typeof fetchedDescription === "object") {
        editor.commands.setContent(fetchedDescription);
        setLocalContent(editor.getHTML());
      } else {
        // try to detect JSON string (ProseMirror doc) safely
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
        // update localContent after applying
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

  /* ---------- Editor update listener: update localContent and schedule autosave ---------- */
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => {
      const html = editor.getHTML();
      setLocalContent(html);

      // clear debounce timer
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      // schedule autosave if enabled and not saving or uploading
      if (!autosaveEnabled || saving || imageUploading) return;

      autosaveTimerRef.current = setTimeout(async () => {
        // prevent autosave right after manual save
        if (isManualSaveRef.current) {
          isManualSaveRef.current = false;
          return;
        }
        try {
          setSaving(true);
          const payload = {
            title,
            category,
            shortDescription,
            description: html,
            imageUrl,
          };
          // full PUT to avoid partial overwrite issues
          await api.put(`/api/programs/${id}`, payload, { headers: { "Content-Type": "application/json" } });
          setLastSavedAt(new Date());
        } catch (err) {
          console.error("Autosave failed:", err);
          // setErr("Autosave failed"); // don't interrupt typing with UI error repeatedly
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

  /* ---------- Revoke preview blob URLs on change/unmount ---------- */
  useEffect(() => {
    return () => {
      try {
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      } catch {}
    };
  }, [previewUrl]);

  /* ---------- Image upload helper ---------- */
  const uploadImageToServer = async (file) => {
    if (!file) return null;
    try {
      setImageUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/api/uploads/single", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // support various shapes
      const url =
        res?.data?.url ||
        res?.data?.secure_url ||
        res?.data?.data?.url ||
        res?.data?.result?.secure_url ||
        res?.data?.file?.secure_url ||
        null;
      return url;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  /* ---------- Main image file change ---------- */
  const handleMainImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (f) {
      // revoke previous blob if any
      try {
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      } catch {}
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  /* ---------- Save handler ---------- */
  const onSave = async (e) => {
    e?.preventDefault();
    if (!id) {
      setErr("Missing program id");
      return;
    }

    // mark manual save (avoid autosave double-trigger)
    isManualSaveRef.current = true;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setSaving(true);
    setErr(null);

    try {
      let finalImageUrl = imageUrl;

      // if user selected a new file, upload it first
      if (imageFile) {
        const uploaded = await uploadImageToServer(imageFile);
        if (!uploaded) throw new Error("Image upload failed");
        finalImageUrl = uploaded;
      }

      // Editor HTML content (string)
      const descriptionHtml = editor ? editor.getHTML() : localContent || "";

      const payload = {
        title,
        category,
        shortDescription,
        description: descriptionHtml,
        imageUrl: finalImageUrl,
      };

      const res = await api.put(`/api/programs/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Accept different response shapes
      const ok =
        !!res &&
        (Boolean(res?.data?.program) || Boolean(res?.data?.doc) || Boolean(res?.data?.updated) || res.status === 200);

      if (!ok) {
        console.warn("Unexpected update response:", res?.data);
        throw new Error("Unexpected server response");
      }

      setLastSavedAt(new Date());
      // navigate back after successful save
      router.push("/admin/programs");
    } catch (error) {
      console.error("Save failed", error);
      setErr(error?.response?.data?.message || error?.message || "Failed to update program");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Quick local UI while loading ---------- */
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

  /* ------------------------- Render ------------------------- */
  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Edit Program</h1>

        {err && <div className="mb-4 text-red-600">{err}</div>}

        <form onSubmit={onSave} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium">Category *</label>
            <select className="w-full border p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="awareness">Awareness</option>
              <option value="environment">Environment</option>
            </select>
          </div>

          {/* Short Description */}
          <div>
            <label className="block mb-1 font-medium">Short Description *</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          {/* Editor + Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-medium">Detailed Description</label>

              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={autosaveEnabled} onChange={(e) => setAutosaveEnabled(e.target.checked)} />
                  <span>Autosave</span>
                </label>

                <button
                  type="button"
                  onClick={() => setPreviewVisible((v) => !v)}
                  className="px-2 py-1 border rounded"
                >
                  {previewVisible ? "Hide Preview" : "Show Preview"}
                </button>

                <div className="text-gray-500">
                  {saving ? "Saving..." : lastSavedAt ? `Saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}` : "Not saved yet"}
                </div>
              </div>
            </div>

            <div className="mb-2">
              <Toolbar editor={editor} onImageUpload={uploadImageToServer} />
            </div>

            <div className="border rounded p-3 bg-white min-h-[220px]">
              {editor ? (
                <EditorContent editor={editor} className="prose prose-invert max-w-none" />
              ) : (
                <div>Loading editor...</div>
              )}
            </div>

            {/* Preview section */}
            {previewVisible && (
              <div className="mt-4 border rounded p-4 bg-gray-50 prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: localContent || (editor ? editor.getHTML() : "") }} />
              </div>
            )}
          </div>

          {/* Program Image */}
          <div>
            <label className="block mb-2 font-medium">Program Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMainImageChange} />
            <div className="mt-3">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-48 rounded border" />
              ) : (
                <div className="text-sm text-gray-500">No image selected</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || imageUploading}
              className={`px-4 py-2 rounded text-white ${saving || imageUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}`}
            >
              {saving ? "Saving..." : imageUploading ? "Uploading image..." : "Save Changes"}
            </button>

            <button type="button" onClick={() => router.push("/admin/programs")} className="px-4 py-2 border rounded">
              Cancel
            </button>

            {imageUploading && <div className="text-sm text-gray-500">Image upload in progress...</div>}
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
