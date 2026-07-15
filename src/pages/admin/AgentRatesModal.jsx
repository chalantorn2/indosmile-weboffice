import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, formatCurrency } from "./lib/adminApi";

/**
 * Contract rates for one agent. Rates are a markup on top of our net (cost) price,
 * and a tour is only visible in the agent portal once it has a rate — so this screen
 * doubles as the agent's tour catalogue. Removing a rate hides the tour from them.
 */
export default function AgentRatesModal({ agent, onClose, onToast }) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState(() => new Set());
  const [filter, setFilter] = useState("all"); // all | rated | unrated
  const [search, setSearch] = useState("");
  const [adultMarkup, setAdultMarkup] = useState("");
  const [childMarkup, setChildMarkup] = useState("");
  const [saving, setSaving] = useState(false);
  const lastClicked = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`agents.php/${agent.id}/rates`);
      if (data.success) setRates(data.data || []);
      else onToast("error", data.message || "Failed to load rates");
    } catch {
      onToast("error", "Error loading rates");
    } finally {
      setLoading(false);
    }
  }, [agent.id, onToast]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rates.filter((row) => {
      const hasRate = row.adult_markup !== null;
      if (filter === "rated" && !hasRate) return false;
      if (filter === "unrated" && hasRate) return false;
      if (q) {
        const hay = `${row.name} ${row.destination || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rates, filter, search]);

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((r) => selection.has(r.tour_id));

  const toggleRow = (tourId, checked, event) => {
    let affected = [tourId];
    if (event?.shiftKey && lastClicked.current !== null) {
      const from = visibleRows.findIndex((r) => r.tour_id === lastClicked.current);
      const to = visibleRows.findIndex((r) => r.tour_id === tourId);
      if (from !== -1 && to !== -1) {
        const [s, e] = from < to ? [from, to] : [to, from];
        affected = visibleRows.slice(s, e + 1).map((r) => r.tour_id);
      }
    }
    setSelection((prev) => {
      const next = new Set(prev);
      affected.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
    lastClicked.current = tourId;
  };

  const toggleAll = (checked) => {
    setSelection((prev) => {
      const next = new Set(prev);
      visibleRows.forEach((r) => (checked ? next.add(r.tour_id) : next.delete(r.tour_id)));
      return next;
    });
  };

  const save = async (method, payload) => {
    setSaving(true);
    try {
      const data = await apiFetch(`agents.php/${agent.id}/rates`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!data.success) {
        onToast("error", data.message || "Failed to save rates");
        return;
      }
      setRates(data.data || []);
      setSelection(new Set());
      lastClicked.current = null;
      onToast("success", data.message || "Rates saved");
    } catch {
      onToast("error", "Error saving rates");
    } finally {
      setSaving(false);
    }
  };

  const apply = () => {
    if (selection.size === 0) return onToast("warning", "Select at least one tour first");
    const adult = parseFloat(adultMarkup);
    const child = childMarkup === "" ? 0 : parseFloat(childMarkup);
    if (Number.isNaN(adult) || adult < 0) return onToast("warning", "Enter an adult markup of 0 or more");
    if (Number.isNaN(child) || child < 0) return onToast("warning", "Child markup cannot be negative");
    save("PUT", { tour_ids: Array.from(selection), adult_markup: adult, child_markup: child });
  };

  const remove = () => {
    if (selection.size === 0) return onToast("warning", "Select at least one tour first");
    if (!window.confirm(`Remove ${selection.size} tour(s) from this agent? They will disappear from the agent's portal.`)) return;
    save("DELETE", { tour_ids: Array.from(selection) });
  };

  const filterBtn = (key, label) => (
    <button
      type="button"
      onClick={() => setFilter(key)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        filter === key ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  const dash = <span className="text-gray-300">—</span>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">
              Contract Rates — {agent.company_name}
            </h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              {agent.agent_code} • only tours with a rate are visible to this agent
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours..."
            className="flex-1 min-w-[200px] px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none"
          />
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {filterBtn("all", "All")}
            {filterBtn("rated", "With rate")}
            {filterBtn("unrated", "No rate")}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="font-body text-gray-500">Loading...</p>
          ) : visibleRows.length === 0 ? (
            <p className="font-body text-gray-500">No tours match this filter.</p>
          ) : (
            <table className="w-full select-none">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2 w-11">
                    <input type="checkbox" checked={allVisibleSelected} onChange={(e) => toggleAll(e.target.checked)} className="w-[18px] h-[18px] cursor-pointer" />
                  </th>
                  <th className="font-body text-sm font-semibold text-gray-500 px-3 py-2">Tour</th>
                  <th className="font-body text-sm font-semibold text-gray-500 px-3 py-2">Destination</th>
                  <th className="font-body text-sm font-semibold text-gray-500 px-3 py-2">Our Net Price</th>
                  <th className="font-body text-sm font-semibold text-gray-500 px-3 py-2">Markup</th>
                  <th className="font-body text-sm font-semibold text-gray-500 px-3 py-2">Agent Rate</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const hasRate = row.adult_markup !== null;
                  const selected = selection.has(row.tour_id);
                  return (
                    <tr
                      key={row.tour_id}
                      onClick={(e) => toggleRow(row.tour_id, !selected, e)}
                      className={`border-b border-gray-50 cursor-pointer ${selected ? "bg-navy/5" : ""} ${hasRate ? "" : "opacity-60"}`}
                    >
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selected} readOnly tabIndex={-1} className="w-[18px] h-[18px] pointer-events-none" />
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-body text-sm font-semibold text-navy">{row.name}</span>
                        {!hasRate && <span className="ml-2 rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-xs font-semibold">No rate</span>}
                      </td>
                      <td className="font-body text-sm text-gray-700 px-3 py-2">{row.destination || "-"}</td>
                      <td className="px-3 py-2">
                        <span className="font-body text-sm text-gray-700">{formatCurrency(row.net_adult_price)}</span>
                        <span className="font-body text-xs text-gray-400"> / {row.net_child_price !== null ? formatCurrency(row.net_child_price) : "—"}</span>
                      </td>
                      <td className="px-3 py-2">
                        {hasRate ? (
                          <>
                            <span className="font-body text-sm text-orange-700">+{formatCurrency(row.adult_markup)}</span>
                            <span className="font-body text-xs text-gray-400"> / {row.net_child_price !== null ? "+" + formatCurrency(row.child_markup) : "—"}</span>
                          </>
                        ) : dash}
                      </td>
                      <td className="px-3 py-2">
                        {hasRate ? (
                          <>
                            <span className="font-body text-sm font-bold text-green-700">{formatCurrency(row.agent_adult_price)}</span>
                            <span className="font-body text-xs text-gray-400"> / {row.agent_child_price !== null ? formatCurrency(row.agent_child_price) : "—"}</span>
                          </>
                        ) : dash}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bulk apply footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-end gap-4">
            <div className="font-body text-sm text-navy font-semibold shrink-0 pb-2.5">
              {selection.size} selected
            </div>
            <div className="w-36">
              <label className="block font-body text-sm font-semibold text-navy mb-1.5">Adult markup</label>
              <input type="number" min="0" step="1" value={adultMarkup} onChange={(e) => setAdultMarkup(e.target.value)} placeholder="150" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none" />
            </div>
            <div className="w-36">
              <label className="block font-body text-sm font-semibold text-navy mb-1.5">Child markup</label>
              <input type="number" min="0" step="1" value={childMarkup} onChange={(e) => setChildMarkup(e.target.value)} placeholder="100" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none" />
            </div>
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={remove} disabled={saving} className="px-5 py-2.5 font-body text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50">Remove selected</button>
              <button type="button" onClick={apply} disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all disabled:opacity-50">Apply to selected</button>
            </div>
          </div>
          <p className="font-body text-xs text-gray-400 mt-3">
            Click a row to select it, <span className="font-semibold">Shift+click</span> to select a range.
            Markup is money added on top of our net price — net 1,000 with a markup of 100 gives the agent 1,100.
            Removing a tour hides it from their portal.
          </p>
        </div>
      </div>
    </div>
  );
}
