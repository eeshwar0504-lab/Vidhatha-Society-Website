// app/admin/programs/create/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import ProtectedRoute from "../../../../components/ProtectedRoute";

// Tiptap imports
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image";

/* ----- Toolbar component ----- */
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
    };
    input.click();
  };

  return (
    <div className="flex gap-2 mb-3 flex-wrap border p-2 rounded bg-gray-50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 border rounded">B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 border rounded"><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-2 py-1 border rounded"><u>U</u></button>

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 border rounded">H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">H2</button>

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 border rounded">• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-2 py-1 border rounded">1. List</button>

      <button
        type="button"
        onClick={() => {
          const url = prompt("Enter URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className="px-2 py-1 border rounded"
      >
        Link
      </button>

      <button type="button" onClick={addImage} className="px-2 py-1 border rounded">Image</button>
    </div>
  );
}

/* ----- Main Create Program Page ----- */
export default function CreateProgramPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("education");
  const [shortDescription, setShortDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Tiptap editor setup — IMPORTANT: immediatelyRender set to false to avoid SSR hydration errors
  const editor = useEditor({
    extensions: [StarterKit, Underline, LinkExtension, ImageExtension],
    content: "",
    immediatelyRender: false,
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Upload helper for both editor images and main image
  const uploadImageToServer = async (file) => {
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await api.post("/api/uploads/single", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url =
        res?.data?.url ||
        res?.data?.secure_url ||
        res?.data?.data?.url ||
        res?.data?.result?.secure_url ||
        null;

      return url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // onChange for main program image input
  const handleMainImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  // form submit
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // upload main image if present
      let imageUrl = null;
      if (imageFile) {
        showMessage("info", "Uploading image...");
        const url = await uploadImageToServer(imageFile);
        if (!url) {
          showMessage("error", "Image upload failed. Try again.");
          setSaving(false);
          return;
        }
        imageUrl = url;
      }

      const payload = {
        title,
        category,
        shortDescription,
        description: editor ? editor.getHTML() : "",
        imageUrl: imageUrl,
      };

      const res = await api.post("/api/programs", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res?.data?.program) {
        console.log("Unexpected create response:", res?.data);
        showMessage("error", "Unexpected server response. Check console.");
        setSaving(false);
        return;
      }

      showMessage("success", "Program created successfully.");
      setTimeout(() => router.push("/admin/programs"), 700);
    } catch (err) {
      console.error("Create program error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create program";
      showMessage("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create Program</h1>

        {/* message */}
        {message.text && (
          <div
            className={`mb-3 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : message.type === "info"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* title */}
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter program title"
            />
          </div>

          {/* category */}
          <div>
            <label className="block mb-1 font-medium">Category *</label>
            <select
              className="w-full border p-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="awareness">Awareness</option>
              <option value="environment">Environment</option>
            </select>
          </div>

          {/* short description */}
          <div>
            <label className="block mb-1 font-medium">Short Description *</label>
            <input
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter a short summary"
            />
          </div>

          {/* detailed description (tiptap) */}
          <div>
            <label className="block mb-1 font-medium">Detailed Description</label>
            <Toolbar editor={editor} onImageUpload={uploadImageToServer} />
            <div className="border rounded p-2 bg-white min-h-[200px]">
              {editor ? <EditorContent editor={editor} /> : <div>Loading editor...</div>}
            </div>
          </div>

          {/* main image */}
          <div>
            <label className="block mb-1 font-medium">Program Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleMainImageChange} />
            {previewUrl && <img src={previewUrl} alt="preview" className="mt-2 max-h-40 rounded border" />}
          </div>

          {/* buttons */}
          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Program"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/programs")}
              className="ml-3 px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
