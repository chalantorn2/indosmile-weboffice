import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { apiGet, apiMutate, formatCurrency } from "./lib/adminApi";
import TourFormModal from "./TourFormModal";

const columnHelper = createColumnHelper();

/**
 * Island Tours admin list. Shows & Adventures live in their own module, matching
 * how the legacy admin split them (app-tours.js vs app-shows.js).
 */
export default function Tours() {
  const queryClient = useQueryClient();
  const [modalTour, setModalTour] = useState(null); // tour object = edit
  const [creating, setCreating] = useState(false);

  const { data: tours = [], isPending } = useQuery({
    queryKey: ["tours", "inbound"],
    queryFn: () => apiGet("tours.php?type=inbound&active=").then((d) => d.items || []),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => apiGet("destinations.php"),
  });

  const closeModal = () => {
    setModalTour(null);
    setCreating(false);
  };

  const onSaved = (message) => {
    closeModal();
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["tours"] });
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (tour) => apiMutate(`tours.php?id=${tour.id}`, "DELETE"),
    onSuccess: () => {
      toast.success("Tour deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
    onError: (err) => toast.error("Error deleting tour: " + (err.message || "")),
  });

  const handleDelete = (tour) => {
    if (!window.confirm(`Delete "${tour.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(tour);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("main_image", {
        header: "Image",
        cell: ({ row, getValue }) =>
          getValue() ? (
            <img
              src={getValue()}
              alt={row.original.name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <span className="text-xs text-gray-400">No img</span>
          ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-semibold text-navy">{info.getValue()}</span>,
      }),
      columnHelper.accessor("destination", { header: "Destination" }),
      columnHelper.accessor("duration_days", {
        header: "Duration",
        cell: ({ row, getValue }) =>
          Number(getValue()) === 1 ? (
            <span className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-semibold">Day Trip</span>
          ) : (
            `${getValue()}D/${row.original.duration_nights}N`
          ),
      }),
      columnHelper.accessor("adult_price", {
        header: "Price",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {Number(row.original.is_featured) === 1 && (
              <span className="rounded-full bg-yellow/20 text-navy px-2.5 py-1 text-xs font-semibold">Featured</span>
            )}
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
            <button
              onClick={() => {
                setCreating(false);
                setModalTour(row.original);
              }}
              className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({ data: tours, columns, getCoreRowModel: getCoreRowModel() });

  const modalOpen = creating || modalTour !== null;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Island Tours</h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            {tours.length} tour{tours.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => {
            setModalTour(null);
            setCreating(true);
          }}
          className="bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all"
        >
          + Add New Island Tour
        </button>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading tours...</p>
        ) : tours.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-body text-gray-500">
              No island tours yet. Click “Add New Island Tour” to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-navy text-white text-left">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`font-body text-sm font-semibold px-4 py-3 ${header.column.columnDef.meta?.align === "right" ? "text-right" : ""}`}
                      >
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
        <TourFormModal
          tour={modalTour}
          destinations={destinations}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
