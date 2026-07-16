import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { apiGet, apiMutate } from "./lib/adminApi";
import ShowFormModal from "./ShowFormModal";
import TourQRModal from "./TourQRModal";

const columnHelper = createColumnHelper();

/** Shows & Adventures admin list (separate from Island Tours, matching the legacy split). */
export default function Shows() {
  const queryClient = useQueryClient();
  const [modalShow, setModalShow] = useState(null);
  const [creating, setCreating] = useState(false);
  const [qrShow, setQrShow] = useState(null);

  const { data: shows = [], isPending } = useQuery({
    queryKey: ["shows"],
    queryFn: () => apiGet("shows.php?active=").then((d) => d.items || []),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => apiGet("destinations.php"),
  });

  const closeModal = () => {
    setModalShow(null);
    setCreating(false);
  };

  const onSaved = (message) => {
    closeModal();
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["shows"] });
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (show) => apiMutate(`shows.php?id=${show.id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Show deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["shows"] });
    },
    onError: (err) => toast.error("Error deleting show: " + (err.message || "")),
  });

  const handleDelete = (show) => {
    if (!window.confirm(`Delete "${show.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(show);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("main_image", {
        header: "Image",
        cell: ({ row, getValue }) =>
          getValue() ? (
            <img src={getValue()} alt={row.original.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200" onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : (
            <span className="text-xs text-gray-400">No img</span>
          ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-semibold text-navy">{info.getValue()}</span>,
      }),
      columnHelper.accessor("destination", { header: "Destination" }),
      columnHelper.accessor("venue", {
        header: "Venue",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("show_times", {
        header: "Showtimes",
        cell: (info) => {
          const times = info.getValue();
          return (
            <div className="flex flex-wrap gap-1">
              {Array.isArray(times) && times.length > 0 ? (
                times.slice(0, 3).map((t, i) => (
                  <span key={i} className="rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-xs font-semibold">{t}</span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {Number(row.original.is_featured) === 1 && <span className="rounded-full bg-yellow/20 text-navy px-2.5 py-1 text-xs font-semibold">Featured</span>}
            {Number(row.original.is_active) === 1 ? (
              <span className="rounded-full bg-green-50 text-green-600 px-2.5 py-1 text-xs font-semibold">Active</span>
            ) : (
              <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-1 text-xs font-semibold">Inactive</span>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => setQrShow(row.original)} className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-yellow bg-yellow/20 rounded-lg hover:bg-yellow transition-all">QR</button>
            <button onClick={() => { setCreating(false); setModalShow(row.original); }} className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-all">Edit</button>
            <button onClick={() => handleDelete(row.original)} className="px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({ data: shows, columns, getCoreRowModel: getCoreRowModel() });

  const modalOpen = creating || modalShow !== null;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Shows & Adventures</h1>
          <p className="font-body text-sm text-gray-500 mt-1">{shows.length} show{shows.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => { setModalShow(null); setCreating(true); }} className="bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all">
          + Add New Show
        </button>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading shows...</p>
        ) : shows.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">No shows yet. Click “Add New Show” to create one.</p>
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
        <ShowFormModal show={modalShow} destinations={destinations} onClose={closeModal} onSaved={onSaved} />
      )}

      {qrShow && <TourQRModal tour={qrShow} detailPath="shows-adventures" onClose={() => setQrShow(null)} />}
    </div>
  );
}
