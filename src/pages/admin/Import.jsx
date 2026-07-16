import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiJson, formatCurrency } from "./lib/adminApi";
import TourFormModal from "./TourFormModal";
import ShowFormModal from "./ShowFormModal";

const IMPORT_MAX_IMAGES = 30;

function parkFee(d) {
  if (Number(d.park_fee_included) === 1) return "Included in price";
  if (!d.park_fee_adult && !d.park_fee_child) return "";
  return `Adult ${d.park_fee_adult || "-"} / Child ${d.park_fee_child || "-"}`;
}

/**
 * Import from Contract Rate. Two-step picker: search a source tour, pick its cover
 * image + target (Island Tour or Show), copy its images into our uploads, then hand
 * off to the matching form modal — seeded at net price, description left for the admin.
 */
export default function Import() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("search"); // search | detail
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // null = not searched yet
  const [searching, setSearching] = useState(false);
  const [detail, setDetail] = useState(null);
  const [cover, setCover] = useState(null);
  const [target, setTarget] = useState("tour");
  const [importing, setImporting] = useState(false);
  const [seedData, setSeedData] = useState(null); // initialData for the form modal

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => apiGet("destinations.php"),
  });

  const runSearch = async () => {
    setSearching(true);
    try {
      const data = await apiGet(`contract_rate.php?action=search&q=${encodeURIComponent(query.trim())}`);
      setResults(data.items || []);
    } catch (err) {
      toast.error(err.message || "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Auto-search while typing (>=2 chars), debounced. Enter and the button still work
  // for an empty query, which lists everything.
  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => runSearch(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const openDetail = async (sourceId) => {
    setStep("detail");
    setDetail(null);
    try {
      const d = await apiGet(`contract_rate.php?action=detail&id=${sourceId}`);
      setDetail(d);
      const images = d.images || [];
      setCover(images.length ? images[0].file_url : null);
      setTarget(d.tour_type === "show_ticket" ? "show" : "tour");
    } catch (err) {
      toast.error(err.message || "Failed to load tour details");
      setStep("search");
    }
  };

  const images = (detail?.images || []).slice(0, IMPORT_MAX_IMAGES);

  const confirmImport = async () => {
    if (!detail) return;
    setImporting(true);

    // Cover first so it can be told apart; the rest keep source order in the gallery.
    const sourceUrls = images.map((img) => img.file_url);
    const urls = sourceUrls.filter((u) => u !== cover);
    if (cover) urls.unshift(cover);

    let localMain = "";
    let localGallery = [];

    if (urls.length > 0) {
      try {
        const data = await apiJson("contract_rate.php?action=import_images", "POST", {
          urls,
          subdir: target === "show" ? "shows" : "tours",
        });
        if (!data.success) {
          toast.error("Image import failed: " + (data.message || ""));
          setImporting(false);
          return;
        }
        const bySource = {};
        data.data.images.forEach((img) => (bySource[img.source_url] = img.url));
        if (cover && bySource[cover]) localMain = bySource[cover];
        localGallery = urls.map((u) => bySource[u]).filter((u) => u && u !== localMain);
        if (data.data.errors?.length) toast.warning("Some images failed: " + data.data.errors.join(", "));
      } catch {
        toast.error("Image import failed. Please try again.");
        setImporting(false);
        return;
      }
    }

    setImporting(false);

    // Build a record-shaped seed the form modals already know how to map. Contract
    // Rate prices are the supplier NET, so they land in the net fields; the selling
    // price is deliberately left blank.
    const d = detail;
    const common = {
      name: d.tour_name || "",
      destination: d.destination || d.departure_from || "",
      net_adult_price: d.adult_price ?? "",
      net_child_price: d.child_price ?? "",
      adult_price: "",
      child_price: "",
      park_fee_included: Number(d.park_fee_included) === 1 ? 1 : 0,
      park_fee_adult: d.park_fee_adult ?? "",
      park_fee_child: d.park_fee_child ?? "",
      important_notes: d.notes || "",
      main_image: localMain,
      gallery_images: localGallery,
      source_tour_id: d.id,
      source_supplier_name: d.supplier_name || "",
    };
    setSeedData(
      target === "show"
        ? { ...common, venue: d.pier || "", duration_days: 1, duration_nights: 0 }
        : { ...common, pickup_location: d.pier || "", duration_days: 1, duration_nights: 0 }
    );
    toast.info("Imported at net price. Set the selling price and description, then save.");
  };

  const onSaved = (message) => {
    setSeedData(null);
    setDetail(null);
    setStep("search");
    setResults(null);
    setQuery("");
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["tours"] });
    queryClient.invalidateQueries({ queryKey: ["shows"] });
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-4xl text-navy">Import from Contract Rate</h1>
        <p className="font-body text-sm text-gray-500 mt-1">
          {step === "search" ? "Search a tour on Contract Rate and pull it in" : "Pick the cover image and where this tour should live"}
        </p>
      </div>

      {step === "search" && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex gap-3 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Type to search, or leave empty and press Enter to list everything"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none"
            />
            <button onClick={runSearch} disabled={searching} className="bg-navy text-white font-body font-semibold px-5 py-2.5 rounded-xl hover:bg-navy/90 transition-all disabled:opacity-50">
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {results === null ? (
            <p className="font-body text-sm text-gray-400 text-center py-10">Type to search, or leave empty and press Enter to list everything.</p>
          ) : results.length === 0 ? (
            <p className="font-body text-sm text-gray-400 text-center py-10">No tours matched that search.</p>
          ) : (
            <>
              <p className="font-body text-xs text-gray-400 mb-2">{results.length} result(s)</p>
              <div className="flex flex-col gap-2">
                {results.map((r) => {
                  const already = r.imported;
                  const where = already ? (already.type === "tour" ? "Island Tours" : "Shows & Adventures") : "";
                  return (
                    <div
                      key={r.source_id}
                      onClick={() => !already && openDetail(r.source_id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${already ? "border-gray-100 bg-gray-50" : "border-gray-200 hover:border-navy hover:bg-navy/[0.02] cursor-pointer"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-navy truncate">{r.tour_name}</p>
                        <p className="font-body text-xs text-gray-400 truncate">
                          {r.supplier_name}
                          {r.departure_from ? ` · ${r.departure_from}` : ""}
                          {r.tour_type ? ` · ${r.tour_type}` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-body text-sm font-semibold text-gray-600">{formatCurrency(r.adult_price)}</p>
                        <p className="font-body text-xs text-gray-400">adult</p>
                      </div>
                      {already && <span className="shrink-0 rounded-full bg-green-50 text-green-600 px-2.5 py-1 text-xs font-semibold">In {where}</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {step === "detail" && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <button onClick={() => { setStep("search"); setDetail(null); }} className="font-body text-sm font-semibold text-navy mb-4 hover:underline">← Back to search</button>

          {!detail ? (
            <p className="font-body text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-5">
                <p className="font-body text-base font-bold text-navy mb-3">{detail.tour_name}</p>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[["Supplier", detail.supplier_name], ["Departure", detail.departure_from], ["Destination", detail.destination], ["Pier / Venue", detail.pier], ["Net adult", detail.adult_price], ["Net child", detail.child_price], ["Park fee", parkFee(detail)]]
                    .filter(([, v]) => v)
                    .map(([label, v]) => (
                      <div key={label}>
                        <dt className="font-body text-xs text-gray-400">{label}</dt>
                        <dd className="font-body text-sm text-gray-700">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
                {detail.notes && <p className="font-body text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200"><span className="text-gray-400">Notes:</span> {detail.notes}</p>}
              </div>

              {/* Target */}
              <div className="mb-5">
                <div className="flex gap-3 mb-2">
                  {[["tour", "Island Tour"], ["show", "Show & Adventure"]].map(([val, label]) => (
                    <button key={val} onClick={() => setTarget(val)} className={`flex-1 px-4 py-3 rounded-xl border-2 font-body text-sm font-semibold transition-all ${target === val ? "border-navy bg-navy/5 text-navy" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="font-body text-xs text-gray-400">
                  {detail.tour_type ? `Contract Rate tags this one as "${detail.tour_type}".` : "Contract Rate has no type on this one — pick where it belongs."}
                </p>
              </div>

              {/* Images */}
              {images.length === 0 ? (
                <p className="font-body text-sm text-gray-400 text-center py-8">This tour has no images on Contract Rate. You can upload your own on the next screen.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                  {images.map((img) => {
                    const isCover = cover === img.file_url;
                    return (
                      <div key={img.file_url} className={`relative rounded-xl overflow-hidden border-2 ${isCover ? "border-navy" : "border-transparent"}`}>
                        <img src={img.file_url} alt={img.original_name} onClick={() => setCover(img.file_url)} className="w-full h-28 object-cover cursor-pointer" loading="lazy" />
                        <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${isCover ? "bg-navy text-white" : "bg-black/40 text-white"}`}>{isCover ? "COVER" : "Gallery"}</span>
                        {img.file_category && <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px]">{img.file_category}</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <span className="font-body text-xs text-gray-400">
                  {images.length === 0 ? "No images to copy" : `All ${images.length} image(s) will be copied — 1 cover + ${images.length - 1} gallery`}
                </span>
                <button onClick={confirmImport} disabled={importing} className="bg-yellow text-navy font-body font-semibold px-6 py-2.5 rounded-xl hover:brightness-95 transition-all disabled:opacity-50">
                  {importing ? "Importing..." : "Continue"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Prefilled form modal (create mode, seeded) */}
      {seedData && target === "tour" && (
        <TourFormModal initialData={seedData} destinations={destinations} onClose={() => setSeedData(null)} onSaved={onSaved} />
      )}
      {seedData && target === "show" && (
        <ShowFormModal initialData={seedData} destinations={destinations} onClose={() => setSeedData(null)} onSaved={onSaved} />
      )}
    </div>
  );
}
