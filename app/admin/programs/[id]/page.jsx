// app/admin/programs/[id]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ToastProvider";

// Tiptap imports
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image";

/* ---------- Constants ---------- */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Enhanced Admin Program Edit page
 * - Polished UI: cards, soft shadows, gradients, subtle animations
 * - Compact toolbar for Tiptap with animated buttons
 * - Responsive layout, image preview, upload helper
 */

/* ---------- Small toolbar used by Edit page ---------- */
function Toolbar({ editor, onImageUpload }) {
  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const url = await onImageUpload(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
      else toast.error("Image upload failed");
    };
    input.click();
  };

  const btn =
    "px-2 py-1 rounded-md text-sm border bg-white/60 hover:scale-[1.03] transition transform";

  return (
    <div className="flex gap-2 mb-3 flex-wrap items-center">
      <div className="inline-flex gap-2 p-2 rounded-md bg-gray-50 border shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btn} ${editor.isActive("bold") ? "ring-2 ring-indigo-200 bg-indigo-50" : ""}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btn} ${editor.isActive("italic") ? "ring-2 ring-indigo-200 bg-indigo-50" : ""}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btn} ${editor.isActive("underline") ? "ring-2 ring-indigo-200 bg-indigo-50" : ""}`}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`${btn} ${editor.isActive("heading", { level: 1 }) ? "ring-2 ring-indigo-200 bg-indigo-50" : ""}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btn} ${editor.isActive("bulletList") ? "ring-2 ring-indigo-200 bg-indigo-50" : ""}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL (include http:// or https://)");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`${btn}`}
        >
          Link
        </button>
        <button type="button" onClick={addImage} className={`${btn}`}>
          Image
        </button>
      </div>
    </div>
  );
}

/* ---------- Page component ---------- */
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
  const [imageUrl, setImageUrl] = useState(null); // current image url
  const [imageFile, setImageFile] = useState(null); // new file to upload
  const [previewUrl, setPreviewUrl] = useState(null);

  // upload states
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Tiptap editor — avoid SSR hydration issues
  const editor = useEditor({
    extensions: [StarterKit, Underline, LinkExtension, ImageExtension],
    content: "",
    immediatelyRender: false,
  });

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
        const program = res?.data?.program || res?.data?.doc || res?.data;
        if (!program) throw new Error("Program not found");

        if (!mounted) return;
        setTitle(program.title || "");
        setCategory(program.category || "education");
        setShortDescription(program.shortDescription || program.short || "");
        setImageUrl(program.imageUrl || program.image || null);
        if (program.imageUrl || program.image) setPreviewUrl(program.imageUrl || program.image);

        // set editor content (if editor already initialized)
        if (editor && program.description) {
          try {
            editor.commands.setContent(program.description);
          } catch (e) {
            setTimeout(() => {
              try {
                editor.commands.setContent(program.description);
              } catch (_) {}
            }, 50);
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.response?.data?.message || e?.message || "Failed to load program");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      // revoke any blob preview URL to prevent leaks
      try {
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, editor]);

  // Upload helper (used for editor images and main image)
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

  const onSave = async (e) => {
    e.preventDefault();
    if (!id) {
      setErr("Missing program id");
      return;
    }

    setSaving(true);
    setErr(null);

    try {
      let newImageUrl = imageUrl;

      // Upload new image if provided
      if (imageFile) {
        const url = await uploadImageToServer(imageFile);
        if (!url) throw new Error("Image upload failed");
        newImageUrl = url;
      }

      const payload = {
        title,
        category,
        shortDescription,
        description: editor ? editor.getHTML() : "",
        imageUrl: newImageUrl,
      };

      const res = await api.put(`/api/programs/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res?.data?.program && !res?.data?.ok) {
        console.warn("Unexpected update response:", res?.data);
        throw new Error("Unexpected server response");
      }

      // nice success animation / feedback might be here (toast handled elsewhere)
      toast.success("Program updated");
      router.push("/admin/programs");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to update program");
      toast.error(e?.response?.data?.message || e?.message || "Failed to update program");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-6 bg-gray-200 rounded w-64" />
            <div className="h-72 bg-white rounded shadow" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Program</h1>
            <p className="text-sm text-gray-500 mt-1">Update program details, images and description. Changes will be visible on the public site once saved.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/programs")}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 transition text-sm"
            >
              Back to Programs
            </button>

            <button
              onClick={onSave}
              disabled={saving}
              className={`px-4 py-2 rounded-md text-white shadow-sm ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-500 hover:scale-[1.02] transform transition"}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {err && <div className="mb-4 text-red-600 rounded p-3 bg-red-50 border border-red-100">{err}</div>}

        <form onSubmit={onSave} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Title *</label>
              <input
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Category *</label>
              <select
                className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="awareness">Awareness</option>
                <option value="environment">Environment</option>
                <option value="social-welfare">Social Welfare</option>
                <option value="community">Community Development</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Short Description *</label>
            <input
              className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Detailed Description</label>
            <Toolbar editor={editor} onImageUpload={uploadImageToServer} />
            <div className="border rounded p-3 bg-white min-h-[220px] shadow-sm">
              {editor ? <EditorContent editor={editor} className="prose max-w-none" /> : <div className="text-gray-500">Loading editor...</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Program Image</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleMainImageChange} className="text-sm" />
                <div className="text-sm text-gray-500">Accepts JPG, PNG. Max 5 MB</div>
              </div>
              <div className="mt-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="max-h-44 rounded border shadow-sm object-cover" />
                ) : (
                  <div className="h-44 rounded border flex items-center justify-center text-gray-400 bg-gray-50">No image selected</div>
                )}
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

            <div className="flex flex-col gap-3">
              <div className="rounded-md border p-3 bg-amber-50 text-sm shadow-sm">
                <div className="font-semibold">Quick Info</div>
                <div className="text-xs text-gray-600 mt-1">ID: <span className="font-mono text-xs">{id}</span></div>
                <div className="text-xs text-gray-600 mt-1">Status: <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Draft</span></div>
              </div>

              <div className="rounded-md border p-3 bg-white shadow-sm">
                <div className="text-sm font-medium mb-2">Actions</div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete this program?")) return;
                      try {
                        await api.delete(`/api/programs/${id}`);
                        router.push("/admin/programs");
                      } catch (e) {
                        console.error(e);
                        setErr(e?.response?.data?.message || e?.message || "Delete failed");
                        toast.error(e?.response?.data?.message || e?.message || "Delete failed");
                      }
                    }}
                    className="px-3 py-2 rounded-md text-sm border text-red-600 hover:bg-red-50 transition"
                  >
                    Delete Program
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/programs/${id}`)}
                    className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50 transition"
                  >
                    View Public Page
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => router.push("/admin/programs")} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition">Cancel</button>

            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-md text-white shadow-sm ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-500 hover:scale-[1.02] transform transition"}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
