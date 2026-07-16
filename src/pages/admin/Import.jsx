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
 * Import from Contract Rate. The mode is chosen up front:
 *  - Tour: pick one source row → seed the Island Tour form.
 *  - Show: tick several source rows that together make up one show (Contract Rate
 *    splits a show into sub-rows / options) → each row becomes a seat zone/ticket,
 *    all merged into a single Show form. Every source row is linked back so it can't
 *    be imported twice.
 * Either way images are copied into our uploads and prices land at supplier NET.
 */
export default function Import() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("tour"); // tour | show
  const [step, setStep] = useState("search"); // search | detail | combine
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // null = not searched yet
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState([]); // source rows picked in show mode
  const [detail, setDetail] = useState(null); // single tour detail
  const [combineDetails, setCombineDetails] = useState(null); // details of every picked row
  const [combineImages, setCombineImages] = useState([]); // merged unique images
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

  const switchMode = (next) => {
    setMode(next);
    setSelected([]);
  };

  const toggleSelect = (row) => {
    setSelected((s) =>
      s.some((x) => x.source_id === row.source_id)
        ? s.filter((x) => x.source_id !== row.source_id)
        : [...s, row]
    );
  };

  // Copy the picked source images into our uploads. `orderedUrls` is cover-first so
  // main/gallery stay straight; returns the local URLs.
  const importImages = async (orderedUrls, coverUrl, subdir) => {
    if (orderedUrls.length === 0) return { localMain: "", localGallery: [] };
    const data = await apiJson("contract_rate.php?action=import_images", "POST", { urls: orderedUrls, subdir });
    if (!data.success) throw new Error(data.message || "");
    const bySource = {};
    data.data.images.forEach((img) => (bySource[img.source_url] = img.url));
    const localMain = coverUrl && bySource[coverUrl] ? bySource[coverUrl] : "";
    const localGallery = orderedUrls.map((u) => bySource[u]).filter((u) => u && u !== localMain);
    if (data.data.errors?.length) toast.warning("Some images failed: " + data.data.errors.join(", "));
    return { localMain, localGallery };
  };

  const openDetail = async (sourceId) => {
    setStep("detail");
    setDetail(null);
    setTarget("tour");
    try {
      const d = await apiGet(`contract_rate.php?action=detail&id=${sourceId}`);
      setDetail(d);
      const imgs = d.images || [];
      setCover(imgs.length ? imgs[0].file_url : null);
    } catch (err) {
      toast.error(err.message || "Failed to load tour details");
      setStep("search");
    }
  };

  const openCombine = async () => {
    if (selected.length === 0) return;
    setStep("combine");
    setCombineDetails(null);
    setTarget("show");
    try {
      const details = await Promise.all(
        selected.map((r) => apiGet(`contract_rate.php?action=detail&id=${r.source_id}`))
      );
      setCombineDetails(details);
      // Merge images from every picked row, de-duped by URL, keeping first-seen order.
      const seen = new Set();
      const merged = [];
      details.forEach((d) =>
        (d.images || []).forEach((img) => {
          if (!seen.has(img.file_url)) {
            seen.add(img.file_url);
            merged.push(img);
          }
        })
      );
      setCombineImages(merged);
      setCover(merged.length ? merged[0].file_url : null);
    } catch (err) {
      toast.error(err.message || "Failed to load details");
      setStep("search");
    }
  };

  const images = (detail?.images || []).slice(0, IMPORT_MAX_IMAGES);
  const combineImagesCapped = combineImages.slice(0, IMPORT_MAX_IMAGES);

  const confirmImport = async () => {
    if (!detail) return;
    setImporting(true);

    // Cover first so it can be told apart; the rest keep source order in the gallery.
    const sourceUrls = images.map((img) => img.file_url);
    const urls = sourceUrls.filter((u) => u !== cover);
    if (cover) urls.unshift(cover);

    let localMain = "";
    let localGallery = [];
    try {
      const res = await importImages(urls, cover, "tours");
      localMain = res.localMain;
      localGallery = res.localGallery;
    } catch {
      toast.error("Image import failed. Please try again.");
      setImporting(false);
      return;
    }
    setImporting(false);

    // Contract Rate prices are the supplier NET, so they land in the net fields; the
    // selling price is deliberately left blank.
    const d = detail;
    setSeedData({
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
      pickup_location: d.pier || "",
      duration_days: 1,
      duration_nights: 0,
    });
    setTarget("tour");
    toast.info("Imported at net price. Set the selling price and description, then save.");
  };

  const confirmCombine = async () => {
    if (!combineDetails || combineDetails.length === 0) return;
    setImporting(true);

    const sourceUrls = combineImagesCapped.map((img) => img.file_url);
    const urls = sourceUrls.filter((u) => u !== cover);
    if (cover) urls.unshift(cover);

    let localMain = "";
    let localGallery = [];
    try {
      const res = await importImages(urls, cover, "shows");
      localMain = res.localMain;
      localGallery = res.localGallery;
    } catch {
      toast.error("Image import failed. Please try again.");
      setImporting(false);
      return;
    }
    setImporting(false);

    // Each picked row becomes one seat zone/ticket, named after the row, seeded at its
    // NET price as a starting point (admin marks it up). Base fields come from the first
    // row; the show name is left blank for the admin to set.
    const first = combineDetails[0];
    const seatZones = combineDetails.map((d) => ({
      name: d.tour_name || "",
      price: d.adult_price ?? "",
      capacity: "",
    }));
    const notes = combineDetails.map((d) => d.notes).filter(Boolean).join("\n");

    setSeedData({
      name: "",
      destination: first.destination || first.departure_from || "",
      venue: first.pier || "",
      duration_days: 1,
      duration_nights: 0,
      net_adult_price: "",
      net_child_price: "",
      adult_price: "",
      child_price: "",
      park_fee_included: Number(first.park_fee_included) === 1 ? 1 : 0,
      park_fee_adult: first.park_fee_adult ?? "",
      park_fee_child: first.park_fee_child ?? "",
      main_image: localMain,
      gallery_images: localGallery,
      seat_zones: seatZones,
      important_notes: notes,
      source_tour_ids: combineDetails.map((d) => d.id),
      source_supplier_name: first.supplier_name || "",
    });
    setTarget("show");
    toast.info("Combined into one show. Set the show name, selling price per zone, and description, then save.");
  };

  const onSaved = (message) => {
    setSeedData(null);
    setDetail(null);
    setCombineDetails(null);
    setCombineImages([]);
    setSelected([]);
    setStep("search");
    setResults(null);
    setQuery("");
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["tours"] });
    queryClient.invalidateQueries({ queryKey: ["shows"] });
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
  };

  const isSelected = (id) => selected.some((x) => x.source_id === id);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-4xl text-navy">Import from Contract Rate</h1>
        <p className="font-body text-sm text-gray-500 mt-1">
          {step === "detail"
            ? "Pick the cover image, then continue to the tour form"
            : step === "combine"
            ? "Each picked row becomes a seat zone — pick the cover, then continue"
            : mode === "show"
            ? "Tick every Contract Rate row that makes up one show, then combine them"
            : "Search a tour on Contract Rate and pull it in"}
        </p>
      </div>

      {step === "search" && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          {/* Mode */}
          <div className="flex gap-3 mb-4">
            {[["tour", "Import a Tour", "One row → one Island Tour"], ["show", "Import a Show", "Combine rows → one Show"]].map(([val, label, hint]) => (
              <button
                key={val}
                onClick={() => switchMode(val)}
                className={`flex-1 px-4 py-3 rounded-xl border-2 font-body text-left transition-all ${mode === val ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}
              >
                <span className={`block text-sm font-semibold ${mode === val ? "text-navy" : "text-gray-500"}`}>{label}</span>
                <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>
              </button>
            ))}
          </div>

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
                  const picked = mode === "show" && isSelected(r.source_id);
                  const onClick = () => {
                    if (already) return;
                    if (mode === "show") toggleSelect(r);
                    else openDetail(r.source_id);
                  };
                  return (
                    <div
                      key={r.source_id}
                      onClick={onClick}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        already
                          ? "border-gray-100 bg-gray-50"
                          : picked
                          ? "border-navy bg-navy/[0.04] cursor-pointer"
                          : "border-gray-200 hover:border-navy hover:bg-navy/[0.02] cursor-pointer"
                      }`}
                    >
                      {mode === "show" && (
                        <input
                          type="checkbox"
                          checked={picked}
                          disabled={!!already}
                          readOnly
                          className="w-4 h-4 shrink-0 accent-navy pointer-events-none"
                        />
                      )}
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

          {/* Selection bar (show mode) */}
          {mode === "show" && selected.length > 0 && (
            <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between rounded-b-xl">
              <span className="font-body text-sm text-gray-600">
                <span className="font-semibold text-navy">{selected.length}</span> row(s) selected — each becomes a seat zone
              </span>
              <div className="flex gap-2">
                <button onClick={() => setSelected([])} className="font-body text-sm font-semibold text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all">
                  Clear
                </button>
                <button onClick={openCombine} className="bg-yellow text-navy font-body font-semibold px-6 py-2.5 rounded-xl hover:brightness-95 transition-all">
                  Combine into one Show
                </button>
              </div>
            </div>
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

      {step === "combine" && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <button onClick={() => { setStep("search"); setCombineDetails(null); }} className="font-body text-sm font-semibold text-navy mb-4 hover:underline">← Back to search</button>

          {!combineDetails ? (
            <p className="font-body text-gray-500">Loading {selected.length} row(s)...</p>
          ) : (
            <>
              <p className="font-body text-base font-bold text-navy mb-1">Combining {combineDetails.length} row(s) into one Show</p>
              <p className="font-body text-xs text-gray-400 mb-4">You’ll set the show name and selling prices on the next screen.</p>

              {/* Rows → seat zones */}
              <div className="rounded-xl border border-gray-100 overflow-hidden mb-5">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 font-body text-xs font-semibold text-gray-400">
                  <span className="col-span-8">Seat zone / ticket (from row name)</span>
                  <span className="col-span-4 text-right">Net adult</span>
                </div>
                {combineDetails.map((d) => (
                  <div key={d.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="col-span-8 font-body text-sm text-navy truncate">{d.tour_name}</span>
                    <span className="col-span-4 text-right font-body text-sm text-gray-600">{formatCurrency(d.adult_price)}</span>
                  </div>
                ))}
              </div>

              {/* Merged images */}
              {combineImagesCapped.length === 0 ? (
                <p className="font-body text-sm text-gray-400 text-center py-8">No images on these rows. You can upload your own on the next screen.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                  {combineImagesCapped.map((img) => {
                    const isCover = cover === img.file_url;
                    return (
                      <div key={img.file_url} className={`relative rounded-xl overflow-hidden border-2 ${isCover ? "border-navy" : "border-transparent"}`}>
                        <img src={img.file_url} alt={img.original_name} onClick={() => setCover(img.file_url)} className="w-full h-28 object-cover cursor-pointer" loading="lazy" />
                        <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${isCover ? "bg-navy text-white" : "bg-black/40 text-white"}`}>{isCover ? "COVER" : "Gallery"}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <span className="font-body text-xs text-gray-400">
                  {combineImagesCapped.length === 0 ? "No images to copy" : `${combineImagesCapped.length} merged image(s) will be copied`}
                </span>
                <button onClick={confirmCombine} disabled={importing} className="bg-yellow text-navy font-body font-semibold px-6 py-2.5 rounded-xl hover:brightness-95 transition-all disabled:opacity-50">
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
