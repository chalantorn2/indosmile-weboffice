import { useState } from "react";
import { apiFetch, apiJson } from "./lib/adminApi";

/** Manage blog categories (add with colour, delete). Mirrors the legacy categories modal. */
export default function BlogCategoriesModal({ categories, onClose, onChanged, onToast }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#010048");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!name.trim()) return onToast("warning", "Please enter a category name");
    setBusy(true);
    try {
      const data = await apiJson("blog_categories.php", "POST", { name: name.trim(), color });
      if (data.success) {
        setName("");
        onToast("success", "Category created!");
        onChanged();
      } else {
        onToast("error", "Error: " + (data.message || ""));
      }
    } catch {
      onToast("error", "Error creating category");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (cat) => {
    if (!window.confirm("Delete this category? Posts in this category will become uncategorized.")) return;
    try {
      const data = await apiFetch(`blog_categories.php?id=${cat.id}`, { method: "DELETE" });
      if (data.success) {
        onToast("success", "Category deleted");
        onChanged();
      } else {
        onToast("error", "Error: " + (data.message || ""));
      }
    } catch {
      onToast("error", "Error deleting category");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-body text-xl font-semibold text-navy">Blog Categories</h2>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          <div className="flex items-end gap-2 mb-5">
            <div className="flex-1">
              <label className="block font-body text-sm font-semibold text-navy mb-1.5">New category</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="e.g. Travel Tips"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none"
              />
            </div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-11 h-11 rounded-lg border border-gray-200 cursor-pointer" title="Category colour" />
            <button onClick={add} disabled={busy} className="px-4 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50">Add</button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-center text-gray-400 py-6 font-body text-sm">No categories yet</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50">
                  <span className="w-4 h-4 rounded shrink-0" style={{ background: cat.color || "#010048" }} />
                  <span className="flex-1 font-body text-sm font-medium text-navy">{cat.name}</span>
                  <span className="font-body text-xs text-gray-400">{cat.post_count || 0} posts</span>
                  <button onClick={() => remove(cat)} className="px-2.5 py-1 font-body text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2.5 font-body text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all">Done</button>
        </div>
      </div>
    </div>
  );
}
