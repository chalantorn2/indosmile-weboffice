import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiMutate } from "./lib/adminApi";

const PER_PAGE = 20;

const STATUS_STYLES = {
  unread: "bg-blue-50 text-blue-600",
  read: "bg-gray-100 text-gray-600",
  replied: "bg-green-50 text-green-600",
  archived: "bg-stone-100 text-stone-500",
};

function StatusBadge({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

function fmt(dt) {
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

function MessageModal({ id, onClose, onChanged }) {
  const [notes, setNotes] = useState("");
  const { data: msg } = useQuery({
    queryKey: ["message", id],
    queryFn: () => apiGet(`contact.php?id=${id}`),
  });

  useEffect(() => {
    if (msg) setNotes(msg.admin_notes || "");
  }, [msg]);

  // Opening a message marks it read on the server; keep the list in sync.
  useEffect(() => {
    if (msg) onChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg?.id]);

  const saveNotes = useMutation({
    mutationFn: () => apiMutate(`contact.php?id=${id}`, "PUT", { admin_notes: notes }),
    onSuccess: () => toast.success("Notes saved"),
    onError: (err) => toast.error("Error saving notes: " + (err.message || "")),
  });

  const setStatus = useMutation({
    mutationFn: (status) => apiMutate(`contact.php?id=${id}`, "PUT", { status }),
    onSuccess: (_d, status) => { toast.success(`Message marked as ${status}`); onChanged(); onClose(); },
    onError: (err) => toast.error("Error updating status: " + (err.message || "")),
  });

  const when = msg ? fmt(msg.created_at) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">{msg ? msg.subject : "Loading..."}</h2>
            {msg && (
              <p className="font-body text-sm text-gray-400 mt-0.5">
                {msg.name} · <a className="text-blue-600 hover:underline" href={`mailto:${msg.email}`}>{msg.email}</a>
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!msg ? (
            <p className="font-body text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge status={msg.status} />
                {when && <span className="font-body text-sm text-gray-400">{when.date} {when.time}</span>}
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5">
                <p className="font-body text-base text-gray-700 whitespace-pre-wrap">{msg.message}</p>
              </div>
              <label className="block font-body text-sm font-semibold text-navy mb-1.5">Admin Notes</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes (not sent to the sender)" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none resize-y" />
              <button onClick={() => saveNotes.mutate()} disabled={saveNotes.isPending} className="mt-2 px-4 py-2 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50">
                {saveNotes.isPending ? "Saving..." : "Save Notes"}
              </button>
            </>
          )}
        </div>

        {msg && (
          <div className="flex items-center gap-2 flex-wrap px-6 py-4 border-t border-gray-100 bg-gray-50">
            {msg.status !== "replied" && (
              <button onClick={() => setStatus.mutate("replied")} className="px-4 py-2 font-body text-sm font-semibold text-white bg-green-600 rounded-lg hover:brightness-95">Mark as Replied</button>
            )}
            {msg.status !== "archived" && (
              <button onClick={() => setStatus.mutate("archived")} className="px-4 py-2 font-body text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Archive</button>
            )}
            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`} className="ml-auto px-4 py-2 font-body text-sm font-semibold text-navy bg-yellow/30 rounded-lg hover:bg-yellow/50 transition-all">Reply via Email</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isPending } = useQuery({
    queryKey: ["messages", page, status, debounced],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (status) params.set("status", status);
      if (debounced) params.set("search", debounced);
      return apiGet(`contact.php?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const messages = data?.items || [];
  const pagination = data?.pagination || {};

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["messages"] });

  const del = useMutation({
    mutationFn: (id) => apiMutate(`contact.php?id=${id}`, "DELETE"),
    onSuccess: () => { toast.success("Message deleted"); invalidate(); },
    onError: (err) => toast.error("Error deleting message: " + (err.message || "")),
  });

  const archive = useMutation({
    mutationFn: (id) => apiMutate(`contact.php?id=${id}`, "PUT", { status: "archived" }),
    onSuccess: () => { toast.success("Message archived"); invalidate(); },
    onError: (err) => toast.error(err.message || "Failed to archive"),
  });

  const selectClass = "px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-700 bg-white focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none";

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="font-heading text-4xl text-navy">Messages</h1>
        <p className="font-body text-sm text-gray-500 mt-1">{pagination.total_items ?? messages.length} message{(pagination.total_items ?? messages.length) === 1 ? "" : "s"}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search name, email, subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[220px] px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectClass}>
          <option value="">All statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? (
          <p className="p-6 font-body text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="p-10 text-center font-body text-gray-500">No messages found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy text-white text-left">
                  <th className="font-body text-sm font-semibold px-4 py-3 w-10"></th>
                  <th className="font-body text-sm font-semibold px-4 py-3">From</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Subject</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Date</th>
                  <th className="font-body text-sm font-semibold px-4 py-3">Status</th>
                  <th className="font-body text-sm font-semibold px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => {
                  const unread = m.status === "unread";
                  const when = fmt(m.created_at);
                  const truncated = m.message.length > 60 ? m.message.substring(0, 60) + "..." : m.message;
                  return (
                    <tr key={m.id} onClick={() => setActiveId(m.id)} className={`border-t border-gray-100 hover:bg-yellow/5 cursor-pointer ${unread ? "bg-navy/[0.02]" : ""}`}>
                      <td className="px-4 py-3 text-center">{unread && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />}</td>
                      <td className="px-4 py-3">
                        <div className={`font-body text-sm ${unread ? "font-semibold text-navy" : "text-gray-700"}`}>{m.name}</div>
                        <div className="font-body text-xs text-gray-400">{m.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-body text-sm ${unread ? "font-semibold text-navy" : "text-gray-700"}`}>{m.subject}</div>
                        <div className="font-body text-xs text-gray-400">{truncated}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-body text-sm text-gray-600">{when.date}</div>
                        <div className="font-body text-xs text-gray-400">{when.time}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setActiveId(m.id)} className="px-3 py-1.5 font-body text-sm font-semibold text-navy border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">View</button>
                          {m.status !== "archived" && (
                            <button onClick={() => archive.mutate(m.id)} className="px-3 py-1.5 font-body text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">Archive</button>
                          )}
                          <button onClick={() => window.confirm("Delete this message? This cannot be undone.") && del.mutate(m.id)} className="px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {activeId && <MessageModal id={activeId} onClose={() => setActiveId(null)} onChanged={invalidate} />}
    </div>
  );
}
