import { useState } from "react";
import { apiJson, uploadFile } from "./lib/adminApi";
import { inputClass, Field, SectionCard } from "./lib/formUi";
import QuillEditor from "./QuillEditor";

const TABS = [
  { key: "content", label: "Content" },
  { key: "media", label: "Media" },
  { key: "settings", label: "Settings" },
];

// ISO datetime -> value for <input type="datetime-local">
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BlogPostModal({ post, categories, onClose, onSaved }) {
  const isEdit = Boolean(post);
  const [tab, setTab] = useState("content");
  const [form, setForm] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    category_id: post?.category_id || "",
    author_name: post?.author_name || "",
    tags: Array.isArray(post?.tags) ? post.tags.join(", ") : post?.tags || "",
    status: post?.status || "draft",
    is_featured: Number(post?.is_featured) === 1,
    cover_image: post?.cover_image || "",
    meta_title: post?.meta_title || "",
    meta_description: post?.meta_description || "",
    published_at: toLocalInput(post?.published_at),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onCover = async (files) => {
    if (!files?.[0]) return;
    setUploading(true);
    try {
      const data = await uploadFile(files[0], "blogs");
      if (data.success) setForm((f) => ({ ...f, cover_image: data.data.url }));
      else setError("Upload failed: " + (data.message || ""));
    } catch {
      setError("Upload error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setTab("content");
      setError("Please enter a title");
      return;
    }
    if (!form.content.trim()) {
      setTab("content");
      setError("Please enter content");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      content: form.content,
      excerpt: form.excerpt || "",
      category_id: form.category_id || null,
      author_name: form.author_name || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: form.status || "draft",
      is_featured: form.is_featured ? 1 : 0,
      cover_image: form.cover_image || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      published_at: form.published_at || null,
    };
    try {
      const path = isEdit ? `blog_posts.php?id=${post.id}` : "blog_posts.php";
      const data = await apiJson(path, isEdit ? "PUT" : "POST", payload);
      if (data.success) onSaved(isEdit ? "Post updated successfully!" : "Post created successfully!");
      else setError("Error: " + (data.message || "could not save post"));
    } catch {
      setError("Error saving post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">{isEdit ? "Edit Post" : "Add New Post"}</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">{isEdit ? "Update the blog article" : "Create a new blog article"}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="flex flex-wrap px-6 bg-gray-50 border-b border-gray-100 gap-1">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`shrink-0 px-4 py-3 font-body text-sm font-semibold border-b-2 transition-all ${tab === t.key ? "text-navy border-navy" : "text-gray-400 border-transparent hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form id="blogPostForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Content — kept mounted so Quill isn't torn down when switching tabs */}
          <div className={tab === "content" ? "" : "hidden"}>
            <SectionCard title="Article Content">
              <div className="mb-4">
                <Field label="Title" required>
                  <input className={inputClass} value={form.title} onChange={set("title")} placeholder="e.g. Top 10 Things to Do in Phuket" />
                </Field>
              </div>
              <div className="mb-4">
                <Field label="Excerpt" hint="(summary shown on cards)">
                  <textarea rows={2} maxLength={500} className={`${inputClass} resize-y`} value={form.excerpt} onChange={set("excerpt")} placeholder="Brief summary of the article..." />
                </Field>
              </div>
              <Field label="Content" required>
                <QuillEditor initialHTML={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
              </Field>
            </SectionCard>
          </div>

          {/* Media */}
          {tab === "media" && (
            <SectionCard title="Cover Image" right="Displayed at the top of the article">
              {form.cover_image ? (
                <div className="relative inline-block">
                  <img src={form.cover_image} alt="Cover" className="max-h-48 rounded-xl border border-gray-200" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, cover_image: "" }))} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-lg leading-none">&times;</button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[140px] flex flex-col items-center justify-center">
                  <p className="font-body text-sm font-medium text-gray-500">{uploading ? "Uploading..." : "Click to upload cover image"}</p>
                  <small className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB) • 1200×630</small>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onCover(e.target.files)} />
                </label>
              )}
            </SectionCard>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div>
              <SectionCard title="Category & Tags">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Category">
                    <select className={inputClass} value={form.category_id} onChange={set("category_id")}>
                      <option value="">-- No category --</option>
                      {(categories || []).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Author Name">
                    <input className={inputClass} value={form.author_name} onChange={set("author_name")} placeholder="e.g. Indo Smile Team" />
                  </Field>
                </div>
                <Field label="Tags" hint="(comma-separated)">
                  <input className={inputClass} value={form.tags} onChange={set("tags")} placeholder="e.g. phuket, travel-tips, beach" />
                </Field>
              </SectionCard>

              <SectionCard title="SEO">
                <div className="mb-4">
                  <Field label="Meta Title" hint="(defaults to post title)">
                    <input className={inputClass} maxLength={200} value={form.meta_title} onChange={set("meta_title")} placeholder="Custom SEO title" />
                  </Field>
                </div>
                <Field label="Meta Description">
                  <textarea rows={2} maxLength={500} className={`${inputClass} resize-y`} value={form.meta_description} onChange={set("meta_description")} placeholder="SEO description for search engines" />
                </Field>
              </SectionCard>

              <SectionCard title="Publishing">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Status">
                    <select className={inputClass} value={form.status} onChange={set("status")}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </Field>
                  <Field label="Publish Date" hint="(auto-set on publish)">
                    <input type="datetime-local" className={inputClass} value={form.published_at} onChange={set("published_at")} />
                  </Field>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={set("is_featured")} />
                  <div>
                    <span className="font-body text-sm font-semibold text-gray-700">Featured Post</span>
                    <p className="text-xs text-gray-400">Show this post prominently at the top of the blog page</p>
                  </div>
                </label>
              </SectionCard>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="font-body text-sm text-red-600">{error}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
            <button type="submit" form="blogPostForm" disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
