import { useEffect, useMemo, useRef, useState } from "react";
import { apiJson, uploadFile, uploadFiles } from "./lib/adminApi";
import { inputClass, Field, MarginHint, PriceInput, SectionCard } from "./lib/formUi";

const GALLERY_MAX = 30;
const DAYS = [
  ["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"],
  ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"],
];

const EMPTY = {
  name: "", destination: "", venue: "",
  duration_days: 1, duration_nights: 0,
  net_adult_price: "", net_child_price: "", adult_price: "", child_price: "",
  park_fee_included: false, park_fee_adult: "", park_fee_child: "",
  short_description: "", description: "", main_image: "",
  highlights: "", included: "", not_included: "",
  min_participants: 1, max_participants: "", rating: 0,
  terms_conditions: "", cancellation_policy: "",
  is_featured: false, is_active: true,
  pickup_time: "", pickup_location: "", dropoff_time: "", dropoff_location: "",
  meal_info: "", transfer_info: "", what_to_bring: "", important_notes: "",
};

const linesToArray = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const arrayToLines = (a) => (Array.isArray(a) ? a.join("\n") : "");

function showToForm(show) {
  return {
    ...EMPTY,
    name: show.name || "", destination: show.destination || "", venue: show.venue || "",
    duration_days: show.duration_days ?? 1, duration_nights: show.duration_nights ?? 0,
    net_adult_price: show.net_adult_price ?? "", net_child_price: show.net_child_price ?? "",
    adult_price: show.adult_price ?? "", child_price: show.child_price ?? "",
    park_fee_included: Number(show.park_fee_included) === 1,
    park_fee_adult: show.park_fee_adult ?? "", park_fee_child: show.park_fee_child ?? "",
    short_description: show.short_description || "", description: show.description || "",
    main_image: show.main_image || "",
    highlights: arrayToLines(show.highlights), included: arrayToLines(show.included),
    not_included: arrayToLines(show.not_included),
    min_participants: show.min_participants ?? 1, max_participants: show.max_participants ?? "",
    rating: show.rating ?? 0,
    terms_conditions: show.terms_conditions || "", cancellation_policy: show.cancellation_policy || "",
    is_featured: Number(show.is_featured) === 1, is_active: Number(show.is_active) === 1,
    pickup_time: show.pickup_time || "", pickup_location: show.pickup_location || "",
    dropoff_time: show.dropoff_time || "", dropoff_location: show.dropoff_location || "",
    meal_info: show.meal_info || "", transfer_info: show.transfer_info || "",
    what_to_bring: Array.isArray(show.what_to_bring) ? show.what_to_bring.join("\n") : show.what_to_bring || "",
    important_notes: show.important_notes || "",
  };
}

const TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "media", label: "Media" },
  { key: "showinfo", label: "Show Info" },
  { key: "details", label: "Details" },
  { key: "settings", label: "Settings" },
];

/**
 * Create/edit a show or adventure. Faithful port of the legacy show modal — same
 * tabs, show times / seat zones / operational days builders, and payload.
 */
export default function ShowFormModal({ show, initialData, destinations, onClose, onSaved }) {
  const isEdit = Boolean(show);
  // A create can be seeded (e.g. the Contract Rate importer) without becoming an edit.
  const seed = show ?? initialData ?? null;
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(EMPTY);
  const [gallery, setGallery] = useState([]);
  const [showTimes, setShowTimes] = useState([]); // string[]
  const [seatZones, setSeatZones] = useState([]); // { name, price, capacity }[]
  const [opDays, setOpDays] = useState([]); // string[]
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mainUploading, setMainUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    if (seed) {
      setForm(showToForm(seed));
      setGallery(Array.isArray(seed.gallery_images) ? [...seed.gallery_images] : []);
      setShowTimes(Array.isArray(seed.show_times) ? [...seed.show_times] : []);
      setSeatZones(
        Array.isArray(seed.seat_zones)
          ? seed.seat_zones.map((z) => ({ name: z.name || "", price: z.price ?? "", capacity: z.capacity ?? "" }))
          : []
      );
      setOpDays(Array.isArray(seed.operational_days) ? [...seed.operational_days] : []);
    } else {
      setForm(EMPTY);
      setGallery([]);
      setShowTimes([]);
      setSeatZones([]);
      setOpDays([]);
    }
    setTab("basic");
    setError("");
  }, [seed]);

  const isMultiDay = Number(form.duration_days) > 1;
  const visibleTabs = useMemo(() => TABS, []);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onMainImage = async (files) => {
    if (!files?.[0]) return;
    setMainUploading(true);
    try {
      const data = await uploadFile(files[0], "shows");
      if (data.success) setForm((f) => ({ ...f, main_image: data.data.url }));
      else setError("Upload failed: " + (data.message || ""));
    } catch {
      setError("Upload error. Please try again.");
    } finally {
      setMainUploading(false);
    }
  };

  const onGalleryImages = async (files) => {
    if (!files?.length) return;
    if (gallery.length + files.length > GALLERY_MAX) {
      setError(`Maximum ${GALLERY_MAX} gallery images allowed.`);
      return;
    }
    setGalleryUploading(true);
    try {
      const data = await uploadFiles(files);
      if (data.success && data.data.urls) setGallery((g) => [...g, ...data.data.urls]);
      if (data.data?.errors?.length) setError("Some uploads failed: " + data.data.errors.join(", "));
    } catch {
      setError("Upload error. Please try again.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const onGalleryDrop = (targetIndex) => {
    const from = dragIndex.current;
    if (from === null || from === targetIndex) return;
    setGallery((g) => {
      const next = [...g];
      const [item] = next.splice(from, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
    dragIndex.current = null;
  };

  const toggleDay = (day) =>
    setOpDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));

  const buildPayload = () => {
    const days = parseInt(form.duration_days, 10) || 1;
    const nights = parseInt(form.duration_nights, 10) || 0;
    const num = (v) => {
      const n = parseFloat(v);
      return Number.isNaN(n) ? null : n;
    };
    return {
      name: form.name,
      destination: form.destination,
      venue: form.venue || null,
      net_adult_price: num(form.net_adult_price),
      net_child_price: num(form.net_child_price),
      adult_price: parseFloat(form.adult_price),
      child_price: num(form.child_price),
      park_fee_included: form.park_fee_included ? 1 : 0,
      park_fee_adult: num(form.park_fee_adult),
      park_fee_child: num(form.park_fee_child),
      duration_days: days,
      duration_nights: days === 1 ? 0 : nights,
      duration_label: days === 1 ? "One Day Experience" : `${days} Days / ${nights} Nights`,
      currency: "THB",
      description: form.description,
      short_description: form.short_description,
      main_image: form.main_image,
      gallery_images: gallery,
      highlights: linesToArray(form.highlights),
      included: linesToArray(form.included),
      not_included: linesToArray(form.not_included),
      show_times: showTimes.map((t) => t.trim()).filter(Boolean),
      seat_zones: seatZones
        .filter((z) => z.name.trim())
        .map((z) => ({ name: z.name.trim(), price: parseFloat(z.price) || 0, capacity: parseInt(z.capacity, 10) || 0 })),
      operational_days: opDays,
      max_participants: parseInt(form.max_participants, 10) || null,
      min_participants: parseInt(form.min_participants, 10) || 1,
      rating: parseFloat(form.rating) || 0,
      review_count: seed?.review_count ?? 0,
      terms_conditions: form.terms_conditions,
      cancellation_policy: form.cancellation_policy,
      is_featured: form.is_featured ? 1 : 0,
      is_active: form.is_active ? 1 : 0,
      pickup_time: form.pickup_time || null,
      pickup_location: form.pickup_location || null,
      dropoff_time: form.dropoff_time || null,
      dropoff_location: form.dropoff_location || null,
      meal_info: form.meal_info || null,
      transfer_info: form.transfer_info || null,
      what_to_bring: form.what_to_bring ? linesToArray(form.what_to_bring) : null,
      important_notes: form.important_notes || null,
      source_tour_id: seed?.source_tour_id ?? null,
      source_tour_ids: Array.isArray(seed?.source_tour_ids) ? seed.source_tour_ids : undefined,
      source_supplier_name: seed?.source_supplier_name ?? null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      ["name", "Show Name"],
      ["destination", "Destination"],
      ["adult_price", "Adult Price"],
      ["description", "Full Description"],
    ];
    for (const [key, label] of required) {
      if (form[key] === "" || form[key] === null || form[key] === undefined) {
        setTab("basic");
        setError(`Please fill in "${label}"`);
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      const path = isEdit ? `shows.php?id=${show.id}` : "shows.php";
      const data = await apiJson(path, isEdit ? "PUT" : "POST", buildPayload());
      if (data.success) onSaved(isEdit ? "Show updated successfully!" : "Show created successfully!");
      else setError("Error: " + (data.message || "could not save show"));
    } catch {
      setError("Error saving show. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">
              {isEdit ? "Edit Show & Adventure" : "Add New Show & Adventure"}
            </h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              {isEdit ? "Update the show details" : "Fill in the details to create a show"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="flex flex-wrap px-6 bg-gray-50 border-b border-gray-100 gap-1">
          {visibleTabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`shrink-0 px-4 py-3 font-body text-sm font-semibold border-b-2 transition-all ${tab === t.key ? "text-navy border-navy" : "text-gray-400 border-transparent hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form id="showForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic */}
          {tab === "basic" && (
            <div>
              <SectionCard title="Show Identity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Show Name" required>
                    <input className={inputClass} value={form.name} onChange={set("name")} placeholder="e.g. Phuket FantaSea" />
                  </Field>
                  <Field label="Destination" required>
                    <input className={inputClass} value={form.destination} onChange={set("destination")} list="admin-destinations" placeholder="e.g. Phuket, Thailand" />
                    <datalist id="admin-destinations">
                      {(destinations || []).map((d) => <option key={d} value={d} />)}
                    </datalist>
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Venue">
                    <input className={inputClass} value={form.venue} onChange={set("venue")} placeholder="e.g. FantaSea Theatre" />
                  </Field>
                  <Field label="Days">
                    <input type="number" min="1" className={inputClass} value={form.duration_days} onChange={set("duration_days")} />
                  </Field>
                  {isMultiDay && (
                    <Field label="Nights">
                      <input type="number" min="0" className={inputClass} value={form.duration_nights} onChange={set("duration_nights")} />
                    </Field>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Pricing (internal net — never shown on website)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Net Adult Price">
                    <PriceInput value={form.net_adult_price} onChange={setValue("net_adult_price")} />
                  </Field>
                  <Field label="Net Child Price">
                    <PriceInput value={form.net_child_price} onChange={setValue("net_child_price")} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Selling Adult Price" required>
                    <PriceInput value={form.adult_price} onChange={setValue("adult_price")} />
                    <MarginHint net={form.net_adult_price} selling={form.adult_price} />
                  </Field>
                  <Field label="Selling Child Price">
                    <PriceInput value={form.child_price} onChange={setValue("child_price")} />
                    <MarginHint net={form.net_child_price} selling={form.child_price} />
                  </Field>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input type="checkbox" checked={form.park_fee_included} onChange={set("park_fee_included")} />
                    <span className="font-body text-sm font-semibold text-navy">National park fee already included above</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Park Fee — Adult">
                      <PriceInput value={form.park_fee_adult} onChange={setValue("park_fee_adult")} />
                    </Field>
                    <Field label="Park Fee — Child">
                      <PriceInput value={form.park_fee_child} onChange={setValue("park_fee_child")} />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Description">
                <div className="mb-4">
                  <Field label="Short Description" hint="(shown on cards)">
                    <input className={inputClass} value={form.short_description} onChange={set("short_description")} maxLength={120} placeholder="Brief one-liner" />
                  </Field>
                </div>
                <Field label="Full Description" required>
                  <textarea rows={5} className={`${inputClass} resize-y`} value={form.description} onChange={set("description")} placeholder="Describe the full experience..." />
                </Field>
              </SectionCard>
            </div>
          )}

          {/* Media */}
          {tab === "media" && (
            <div>
              <SectionCard title="Cover Image" right="Show thumbnail">
                {form.main_image ? (
                  <div className="relative inline-block">
                    <img src={form.main_image} alt="Main" className="max-h-48 rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, main_image: "" }))} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-lg leading-none">&times;</button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[140px] flex flex-col items-center justify-center">
                    <p className="font-body text-sm font-medium text-gray-500">{mainUploading ? "Uploading..." : "Click to upload cover image"}</p>
                    <small className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB)</small>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onMainImage(e.target.files)} />
                  </label>
                )}
              </SectionCard>
              <SectionCard title="Gallery" right={`${gallery.length} / ${GALLERY_MAX} images`}>
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {gallery.map((url, i) => (
                    <div key={url + i} draggable onDragStart={() => (dragIndex.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onGalleryDrop(i)} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-grab">
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                      <button type="button" onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none">&times;</button>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all flex flex-col items-center justify-center">
                  <p className="font-body text-sm font-medium text-gray-500">{galleryUploading ? "Uploading..." : "Click to upload multiple images"}</p>
                  <small className="text-xs text-gray-400 mt-1">Drag thumbnails to reorder</small>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onGalleryImages(e.target.files)} />
                </label>
              </SectionCard>
            </div>
          )}

          {/* Show Info */}
          {tab === "showinfo" && (
            <div>
              <SectionCard title="Operational Days">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(([val, label]) => {
                    const on = opDays.includes(val);
                    return (
                      <button key={val} type="button" onClick={() => toggleDay(val)} className={`px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${on ? "border-navy bg-navy text-white" : "border-gray-200 text-gray-600 hover:border-navy"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="Show Times" right={`${showTimes.length} time${showTimes.length === 1 ? "" : "s"}`}>
                <div className="flex flex-col gap-2">
                  {showTimes.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className={inputClass} value={t} onChange={(e) => setShowTimes((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder="e.g. 18:00" />
                      <button type="button" onClick={() => setShowTimes((arr) => arr.filter((_, idx) => idx !== i))} className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all">Remove</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setShowTimes((arr) => [...arr, ""])} className="mt-3 w-full px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-gray-400 hover:border-navy hover:text-navy transition-all">+ Add Time</button>
              </SectionCard>

              <SectionCard title="Seat Zones / Ticket Categories">
                <div className="flex flex-col gap-2">
                  {seatZones.map((z, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input className={`${inputClass} col-span-5`} value={z.name} onChange={(e) => setSeatZones((arr) => arr.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} placeholder="Zone name (e.g. VIP)" />
                      <PriceInput className={`${inputClass} col-span-3`} value={z.price} onChange={(v) => setSeatZones((arr) => arr.map((x, idx) => (idx === i ? { ...x, price: v } : x)))} placeholder="Price" />
                      <input type="number" className={`${inputClass} col-span-3`} value={z.capacity} onChange={(e) => setSeatZones((arr) => arr.map((x, idx) => (idx === i ? { ...x, capacity: e.target.value } : x)))} placeholder="Capacity" />
                      <button type="button" onClick={() => setSeatZones((arr) => arr.filter((_, idx) => idx !== i))} className="col-span-1 px-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all">✕</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setSeatZones((arr) => [...arr, { name: "", price: "", capacity: "" }])} className="mt-3 w-full px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-gray-400 hover:border-navy hover:text-navy transition-all">+ Add Zone</button>
              </SectionCard>

              <SectionCard title="Pickup & Dropoff">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Pickup Time"><input className={inputClass} value={form.pickup_time} onChange={set("pickup_time")} placeholder="e.g. 05:30 PM" /></Field>
                  <Field label="Pickup Location"><input className={inputClass} value={form.pickup_location} onChange={set("pickup_location")} placeholder="e.g. Hotel Lobby" /></Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Dropoff Time"><input className={inputClass} value={form.dropoff_time} onChange={set("dropoff_time")} placeholder="e.g. 10:00 PM" /></Field>
                  <Field label="Dropoff Location"><input className={inputClass} value={form.dropoff_location} onChange={set("dropoff_location")} placeholder="e.g. Same as pickup" /></Field>
                </div>
              </SectionCard>

              <SectionCard title="Service Info">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Meal Info"><input className={inputClass} value={form.meal_info} onChange={set("meal_info")} placeholder="e.g. Dinner included" /></Field>
                  <Field label="Transfer Info"><input className={inputClass} value={form.transfer_info} onChange={set("transfer_info")} placeholder="e.g. Round-trip transfer" /></Field>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Details */}
          {tab === "details" && (
            <div>
              <SectionCard title="Highlights">
                <Field label="Key Highlights" hint="(one per line)">
                  <textarea rows={4} className={`${inputClass} resize-y`} value={form.highlights} onChange={set("highlights")} placeholder={"Live performance\nCultural show\nDinner buffet"} />
                </Field>
              </SectionCard>
              <SectionCard title="Inclusions">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Included" hint="(one per line)">
                    <textarea rows={5} className={`${inputClass} resize-y`} value={form.included} onChange={set("included")} placeholder={"Show ticket\nDinner\nTransfer"} />
                  </Field>
                  <Field label="Not Included" hint="(one per line)">
                    <textarea rows={5} className={`${inputClass} resize-y`} value={form.not_included} onChange={set("not_included")} placeholder={"Personal expenses"} />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Additional Info">
                <div className="mb-4">
                  <Field label="What to Bring" hint="(one per line)">
                    <textarea rows={4} className={`${inputClass} resize-y`} value={form.what_to_bring} onChange={set("what_to_bring")} placeholder={"Camera\nLight jacket"} />
                  </Field>
                </div>
                <Field label="Important Notes">
                  <textarea rows={4} className={`${inputClass} resize-y`} value={form.important_notes} onChange={set("important_notes")} placeholder="Additional important information..." />
                </Field>
              </SectionCard>
            </div>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div>
              <SectionCard title="Capacity">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Min Participants"><input type="number" min="1" className={inputClass} value={form.min_participants} onChange={set("min_participants")} /></Field>
                  <Field label="Max Participants"><input type="number" min="1" className={inputClass} value={form.max_participants} onChange={set("max_participants")} placeholder="20" /></Field>
                  <Field label="Rating (0-5)"><input type="number" min="0" max="5" step="0.1" className={inputClass} value={form.rating} onChange={set("rating")} /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Policies">
                <div className="mb-4">
                  <Field label="Terms & Conditions">
                    <textarea rows={4} className={`${inputClass} resize-y`} value={form.terms_conditions} onChange={set("terms_conditions")} placeholder="Booking terms..." />
                  </Field>
                </div>
                <Field label="Cancellation Policy">
                  <textarea rows={4} className={`${inputClass} resize-y`} value={form.cancellation_policy} onChange={set("cancellation_policy")} placeholder="Free cancellation up to 48 hours before..." />
                </Field>
              </SectionCard>
              <SectionCard title="Visibility">
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={set("is_featured")} />
                  <div>
                    <span className="font-body text-sm font-semibold text-gray-700">Featured Show</span>
                    <p className="text-xs text-gray-400">Show in the featured section on homepage</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={set("is_active")} />
                  <div>
                    <span className="font-body text-sm font-semibold text-gray-700">Active</span>
                    <p className="text-xs text-gray-400">Visible and bookable by customers</p>
                  </div>
                </label>
              </SectionCard>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="font-body text-sm text-red-600">{error}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
            <button type="submit" form="showForm" disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Show"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
