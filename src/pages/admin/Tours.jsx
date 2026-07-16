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
import TourQRModal from "./TourQRModal";

const columnHelper = createColumnHelper();

/**
 * Keyed on the mode so React remounts it and replays the animation on every
 * toggle — most tours have net === selling, and without the motion the switch
 * looks like it did nothing.
 */
function PriceCell({ value, showNet }) {
  return (
    <span
      key={showNet ? "net" : "selling"}
      className={`animate-price-swap inline-block font-body tabular-nums ${
        showNet ? "text-navy font-semibold" : "text-gray-700"
      }`}
    >
      {formatCurrency(value)}
    </span>
  );
}

/**
 * Island Tours admin list. Shows & Adventures live in their own module, matching
 * how the legacy admin split them (app-tours.js vs app-shows.js).
 */
export default function Tours() {
  const queryClient = useQueryClient();
  const [modalTour, setModalTour] = useState(null); // tour object = edit
  const [creating, setCreating] = useState(false);
  const [qrTour, setQrTour] = useState(null); // tour object = show QR modal
  const [showNet, setShowNet] = useState(false); // false = selling price, true = net price
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState(""); // "" = all destinations

  const { data: tours = [], isPending } = useQuery({
    queryKey: ["tours", "inbound"],
    queryFn: () => apiGet("tours.php?type=inbound&active=").then((d) => d.items || []),
  });

  const provinceOptions = useMemo(
    () => [...new Set(tours.map((t) => t.destination).filter(Boolean))].sort(),
    [tours]
  );

  const filteredTours = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tours.filter((t) => {
      if (province && t.destination !== province) return false;
      if (q && !(`${t.name} ${t.destination || ""}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [tours, search, province]);

  const closeModal = () => {
    setModalTour(null);
    setCreating(false);
  };

  const onSaved = (message) => {
    closeModal();
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["tours"] });
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
      // The id must differ per mode: rows are memoized on `data` alone, so a row
      // keeps its _valuesCache across a toggle and a reused id would keep serving
      // the price from the previous mode.
      columnHelper.accessor(showNet ? "net_adult_price" : "adult_price", {
        id: showNet ? "net_adt_price" : "adt_price",
        header: showNet ? "Net ADT" : "ADT",
        cell: (info) => <PriceCell value={info.getValue()} showNet={showNet} />,
      }),
      columnHelper.accessor(showNet ? "net_child_price" : "child_price", {
        id: showNet ? "net_chd_price" : "chd_price",
        header: showNet ? "Net CHD" : "CHD",
        cell: (info) => <PriceCell value={info.getValue()} showNet={showNet} />,
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
              onClick={() => setQrTour(row.original)}
              className="px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-yellow bg-yellow/20 rounded-lg hover:bg-yellow transition-all"
            >
              QR
            </button>
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
    [showNet]
  );

  const table = useReactTable({ data: filteredTours, columns, getCoreRowModel: getCoreRowModel() });

  const modalOpen = creating || modalTour !== null;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading text-4xl text-navy">Island Tours</h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            {filteredTours.length} of {tours.length} tour{tours.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowNet((v) => !v)}
            className="flex items-center gap-2.5 font-body text-sm font-semibold text-navy"
            title="Toggle between selling and net prices"
          >
            <span className={showNet ? "text-gray-400" : ""}>Selling</span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showNet ? "bg-navy" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showNet ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </span>
            <span className={showNet ? "" : "text-gray-400"}>Net</span>
          </button>
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
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tours..."
          className="flex-1 min-w-[200px] px-4 py-2.5 font-body text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy/20 focus:border-navy focus:outline-none"
        />
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="px-4 py-2.5 font-body text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy/20 focus:border-navy focus:outline-none bg-white"
        >
          <option value="">All destinations</option>
          {provinceOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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
        ) : filteredTours.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-body text-gray-500">No tours match your filters.</p>
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
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}

      {qrTour && <TourQRModal tour={qrTour} onClose={() => setQrTour(null)} />}
    </div>
  );
}
