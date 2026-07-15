import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { apiGet, apiMutate, formatCurrency, formatDate, isAwaitingPayment } from "./lib/adminApi";
import { StatusBadges } from "./bookingStatus";
import BookingDetailModal from "./BookingDetailModal";

const PAGE_SIZE = 20;

// Trim long tour names in the list; the full name stays available on hover (title attr).
const truncate = (s, n) => (s && s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

const columnHelper = createColumnHelper();

export default function Bookings() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [active, setActive] = useState(null); // booking under the detail modal

  // Debounce the free-text search so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters = { page, status, payment, search: debouncedSearch, dateFrom, dateTo };

  const { data, isPending, isError } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (status) params.set("status", status);
      if (payment) params.set("payment_status", payment);
      if (debouncedSearch) params.set("search", debouncedSearch);
      // Travel-date range. If only "From" is set, match that single day (To defaults to From).
      if (dateFrom) {
        params.set("date_from", dateFrom);
        params.set("date_to", dateTo || dateFrom);
      } else if (dateTo) {
        params.set("date_to", dateTo);
      }
      return apiGet(`bookings.php?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load bookings.");
  }, [isError]);

  const bookings = data?.items || [];
  const pagination = data?.pagination || null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["bookings"] });

  const confirmMutation = useMutation({
    mutationFn: (booking) => apiMutate(`bookings.php?id=${booking.id}&action=confirm`, "PUT", {}),
    onSuccess: () => {
      toast.success("Confirmed. Payment link sent.");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Network error. Please try again."),
  });

  const quickConfirm = (booking) => {
    if (
      !window.confirm(
        `Confirm ${booking.booking_reference}?\n\nThis emails ${booking.customer_email} a Pay Now link for ${formatCurrency(booking.total_price)}.`
      )
    )
      return;
    confirmMutation.mutate(booking);
  };

  // Filters (other than search) reset to page 1 immediately.
  const onFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const onActionDone = (message) => {
    setActive(null);
    toast.success(message);
    invalidate();
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("booking_reference", {
        header: "Reference",
        cell: (info) => (
          <span title={info.getValue()} className="font-mono text-sm text-navy block max-w-[110px] truncate">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <>
            <div className="font-body text-sm text-gray-700">{row.original.customer_name}</div>
            <div className="font-body text-xs text-gray-400">{row.original.customer_email}</div>
          </>
        ),
      }),
      columnHelper.accessor("tour_name", {
        header: "Tour",
        cell: (info) => (
          <span title={info.getValue() || "-"} className="block max-w-[200px] truncate">
            {truncate(info.getValue(), 25) || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("travel_date", {
        header: "Travel Date",
        cell: (info) => <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.accessor("adults", {
        header: () => <span title="Adults">ADT</span>,
        cell: (info) => Number(info.getValue()) || 0,
        meta: { align: "center" },
      }),
      columnHelper.accessor("children", {
        header: () => <span title="Children">CHD</span>,
        cell: (info) => Number(info.getValue()) || 0,
        meta: { align: "center" },
      }),
      columnHelper.accessor("infants", {
        header: () => <span title="Infants">INF</span>,
        cell: (info) => Number(info.getValue()) || 0,
        meta: { align: "center" },
      }),
      columnHelper.accessor("total_price", {
        header: "Total",
        cell: ({ row, getValue }) => (
          <span className={row.original.payment_status === "paid" ? "font-bold text-green-600" : "text-gray-700"}>
            {formatCurrency(getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadges booking={row.original} showPayment={false} />,
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        meta: { align: "right" },
        cell: ({ row }) => {
          const b = row.original;
          return b.status === "pending" ? (
            <button
              onClick={() => quickConfirm(b)}
              disabled={confirmMutation.isPending}
              className="px-3 py-1.5 font-body text-sm font-semibold text-white bg-green-600 rounded-lg hover:brightness-95 disabled:opacity-50"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={() => setActive(b)}
              className="px-3 py-1.5 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {isAwaitingPayment(b) ? "Manage" : "View"}
            </button>
          );
        },
      }),
    ],
    // quickConfirm/confirmMutation are stable enough for the row buttons; columns
    // don't need to rebuild on every mutation state tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const alignClass = (col) =>
    col.columnDef.meta?.align === "center"
      ? "text-center"
      : col.columnDef.meta?.align === "right"
        ? "text-right"
        : "text-left";

  const selectClass =
    "px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-700 bg-white focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none";

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="font-heading text-4xl text-navy">Bookings</h1>
        {pagination && (
          <p className="font-body text-sm text-gray-500 mt-1">
            {pagination.total_items} booking{pagination.total_items === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search reference, name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none"
        />
        <select value={status} onChange={(e) => onFilterChange(setStatus)(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={payment} onChange={(e) => onFilterChange(setPayment)(e.target.value)} className={selectClass}>
          <option value="">All payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="font-body text-sm text-gray-500">Travel</label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onFilterChange(setDateFrom)(e.target.value)}
            title="From (leave To empty to match this single day)"
            className={selectClass}
          />
          <span className="font-body text-sm text-gray-400">–</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onFilterChange(setDateTo)(e.target.value)}
            title="To"
            className={selectClass}
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                onFilterChange(setDateFrom)("");
                setDateTo("");
              }}
              className="font-body text-sm text-gray-400 hover:text-navy"
              title="Clear date filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">
            No bookings match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-navy text-white text-left">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`font-body text-sm font-semibold px-4 py-3 ${alignClass(header.column)}`}
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
                      <td
                        key={cell.id}
                        className={`px-4 py-3 font-body text-sm text-gray-700 ${alignClass(cell.column)}`}
                      >
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

      {/* Legend: what the green Total means, now that the paid/unpaid pill is gone. */}
      <p className="font-body text-xs text-gray-400 mt-2">
        <span className="font-bold text-green-600">Green total</span> = payment received (paid). ADT / CHD / INF = adults / children / infants.
      </p>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="font-body text-sm text-gray-500">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.has_prev}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>
            <button
              disabled={!pagination.has_next}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {active && (
        <BookingDetailModal
          booking={active}
          onClose={() => setActive(null)}
          onActionDone={onActionDone}
          onError={(msg) => toast.error(msg)}
        />
      )}
    </div>
  );
}
