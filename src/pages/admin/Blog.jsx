import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { apiGet, apiMutate, formatDate } from "./lib/adminApi";
import BlogPostModal from "./BlogPostModal";
import BlogCategoriesModal from "./BlogCategoriesModal";

const columnHelper = createColumnHelper();

const STATUS_STYLES = {
  published: "bg-green-50 text-green-600",
  draft: "bg-amber-50 text-amber-600",
  archived: "bg-red-50 text-red-600",
};

// Bridge the legacy onToast(type, message) callback used by BlogCategoriesModal to Sonner.
const toastAdapter = (type, message) =>
  (toast[type] || toast.message)(message);

export default function Blog() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalPost, setModalPost] = useState(null);
  const [creating, setCreating] = useState(false);
  const [catModal, setCatModal] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["blog_categories"],
    queryFn: () => apiGet("blog_categories.php"),
  });

  const { data: posts = [], isPending } = useQuery({
    queryKey: ["blog_posts", { categoryFilter, statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams({ all: "1", limit: "100" });
      if (categoryFilter) params.set("category_id", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      return apiGet(`blog_posts.php?${params}`).then((d) => d.items || []);
    },
  });

  const closeModal = () => {
    setModalPost(null);
    setCreating(false);
  };

  const onSaved = (message) => {
    closeModal();
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
    queryClient.invalidateQueries({ queryKey: ["blog_categories"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (post) => apiMutate(`blog_posts.php?id=${post.id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Blog post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
    },
    onError: (err) => toast.error("Error deleting post: " + (err.message || "")),
  });

  const handleDelete = (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(post);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("cover_image", {
        header: "Image",
        cell: ({ row, getValue }) =>
          getValue() ? (
            <img src={getValue()} alt={row.original.title} className="w-14 h-14 rounded-lg object-cover border border-gray-200" onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : (
            <span className="text-xs text-gray-400">No img</span>
          ),
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: ({ row, getValue }) => (
          <>
            <span className="font-body text-sm font-semibold text-navy">{getValue()}</span>
            {Number(row.original.is_featured) === 1 && <span className="ml-2 rounded-full bg-yellow/20 text-navy px-2 py-0.5 text-xs font-semibold">Featured</span>}
          </>
        ),
      }),
      columnHelper.accessor("category_name", {
        header: "Category",
        cell: ({ row, getValue }) =>
          getValue() ? (
            <span className="inline-flex items-center gap-1.5 font-body text-sm text-gray-700">
              <span className="w-2 h-2 rounded-full" style={{ background: row.original.category_color || "#010048" }} />
              {getValue()}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[info.getValue()] || "bg-gray-100 text-gray-600"}`}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("views", {
        header: "Views",
        cell: (info) => info.getValue() || 0,
      }),
      columnHelper.accessor("published_at", {
        header: "Date",
        cell: (info) => (info.getValue() ? formatDate(info.getValue()) : <span className="text-gray-400">—</span>),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setCreating(false); setModalPost(row.original); }} className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-all">Edit</button>
            <button onClick={() => handleDelete(row.original)} className="px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({ data: posts, columns, getCoreRowModel: getCoreRowModel() });

  const selectClass =
    "px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-700 bg-white focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none";
  const modalOpen = creating || modalPost !== null;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Blog</h1>
          <p className="font-body text-sm text-gray-500 mt-1">{posts.length} post{posts.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCatModal(true)} className="font-body text-sm font-semibold text-navy border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all">Categories</button>
          <button onClick={() => { setModalPost(null); setCreating(true); }} className="bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all">+ Add New Post</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.post_count || 0})</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">No blog posts yet. Click “Add New Post” to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-navy text-white text-left">
                    {hg.headers.map((header) => (
                      <th key={header.id} className={`font-body text-sm font-semibold px-4 py-3 ${header.column.columnDef.meta?.align === "right" ? "text-right" : ""}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-yellow/5">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 font-body text-sm text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <BlogPostModal
          key={modalPost ? modalPost.id : "new"}
          post={modalPost}
          categories={categories}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
      {catModal && (
        <BlogCategoriesModal
          categories={categories}
          onClose={() => setCatModal(false)}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ["blog_categories"] })}
          onToast={toastAdapter}
        />
      )}
    </div>
  );
}
