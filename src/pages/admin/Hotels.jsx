import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { apiGet, apiMutate } from "./lib/adminApi";
import HotelFormModal from "./HotelFormModal";

const columnHelper = createColumnHelper();
const PER_PAGE = 20;

function stars(n) {
  const s = Math.max(0, Math.min(5, Number(n) || 0));
  return "★".repeat(s) + "☆".repeat(5 - s);
}

export default function Hotels() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalHotel, setModalHotel] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["hotels", page],
    queryFn: () => apiGet(`hotels.php?active=&page=${page}&limit=${PER_PAGE}`),
    placeholderData: keepPreviousData,
  });

  const hotels = data?.items || [];
  const pagination = data?.pagination || {};

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => apiGet("destinations.php"),
  });

  const closeModal = () => {
    setModalHotel(null);
    setCreating(false);
  };

  const onSaved = (message) => {
    closeModal();
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["hotels"] });
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (hotel) => apiMutate(`hotels.php?id=${hotel.id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Hotel deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
    onError: (err) => toast.error("Error deleting hotel: " + (err.message || "")),
  });

  const handleDelete = (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(hotel);
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
      columnHelper.accessor("stars", {
        header: "Stars",
        cell: (info) => <span className="text-yellow">{stars(info.getValue())}</span>,
      }),
      columnHelper.accessor("room_types", {
        header: "Rooms",
        cell: (info) => `${Array.isArray(info.getValue()) ? info.getValue().length : 0} types`,
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
            <button onClick={() => { setCreating(false); setModalHotel(row.original); }} className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-all">Edit</button>
            <button onClick={() => handleDelete(row.original)} className="px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({ data: hotels, columns, getCoreRowModel: getCoreRowModel() });
  const modalOpen = creating || modalHotel !== null;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Hotels</h1>
          <p className="font-body text-sm text-gray-500 mt-1">{pagination.total_items ?? hotels.length} hotel{(pagination.total_items ?? hotels.length) === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => { setModalHotel(null); setCreating(true); }} className="bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all">
          + Add New Hotel
        </button>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading hotels...</p>
        ) : hotels.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">No hotels yet. Click “Add New Hotel” to create one.</p>
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

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="font-body text-sm text-gray-500">Page {pagination.current_page} of {pagination.total_pages}</span>
          <div className="flex gap-2">
            <button disabled={!pagination.has_prev} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹ Prev</button>
            <button disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next ›</button>
          </div>
        </div>
      )}

      {modalOpen && (
        <HotelFormModal hotel={modalHotel} destinations={destinations} onClose={closeModal} onSaved={onSaved} />
      )}
    </div>
  );
}
