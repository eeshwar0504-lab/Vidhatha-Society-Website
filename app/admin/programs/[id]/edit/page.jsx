"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

// Tiptap imports
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image";

/* ----- Small Tiptap toolbar used by Edit page ----- */
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
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 border rounded">• List</button>
      <button type="button" onClick={() => {
        const url = prompt("Enter URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }} className="px-2 py-1 border rounded">Link</button>
      <button type="button" onClick={addImage} className="px-2 py-1 border rounded">Image</button>
    </div>
  );
}

/* ----- Edit Program Page (client) ----- */
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

  // TIPTAP editor — avoid SSR hydration issues by setting immediatelyRender:false
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
        const res = await api.get(`/api/programs/${id}`);
        const program = res?.data?.program || res?.data?.doc || res?.data;
        if (!program) throw new Error("Program not found");

        if (!mounted) return;
        setTitle(program.title || "");
        setCategory(program.category || "education");
        setShortDescription(program.short || program.shortDescription || "");
        setImageUrl(program.imageUrl || (program.images && program.images[0]) || null);
        if (program.imageUrl) setPreviewUrl(program.imageUrl);
        else if (program.images && program.images.length) setPreviewUrl(program.images[0]);

        // set editor content (if editor already initialized)
        if (editor && program.description) {
          try {
            editor.commands.setContent(program.description);
          } catch (e) {
            setTimeout(() => {
              try { editor.commands.setContent(program.description); } catch (_) {}
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

    return () => { mounted = false; };
  }, [id, editor]);

  // Upload helper (used for both editor images and main image)
  const uploadImageToServer = async (file) => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/api/uploads/single", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res?.data?.url || res?.data?.secure_url || res?.data?.data?.url || res?.data?.result?.secure_url || null;
    } catch (e) {
      console.error("Upload failed:", e);
      return null;
    }
  };

  const handleMainImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
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

      if (!res?.data?.program) {
        console.log("Unexpected update response:", res?.data);
        throw new Error("Unexpected server response");
      }

      router.push("/admin/programs");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to update program");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProtectedRoute><div className="p-6">Loading...</div></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl mb-4">Edit Program</h1>

        {err && <div className="mb-3 text-red-600">{err}</div>}

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
            <input className="w-full border p-2 rounded" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
          </div>

          <div>
            <label className="block mb-1 font-medium">Detailed Description</label>
            <Toolbar editor={editor} onImageUpload={uploadImageToServer} />
            <div className="border rounded p-2 bg-white min-h-[200px]">
              {editor ? <EditorContent editor={editor} /> : <div>Loading editor...</div>}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Program Image</label>
            <input type="file" accept="image/*" onChange={handleMainImageChange} />
            {previewUrl && <img src={previewUrl} alt="preview" className="mt-2 max-h-40 rounded border" />}
          </div>

          <div>
            <button disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.push("/admin/programs")} className="ml-3 px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
