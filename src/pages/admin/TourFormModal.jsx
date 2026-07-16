import { useEffect, useRef, useState } from "react";
import { apiJson, uploadFile, uploadFiles } from "./lib/adminApi";
import { MarginHint, PriceInput } from "./lib/formUi";
import { THAI_DESTINATIONS } from "./lib/thaiDestinations";

const GALLERY_MAX = 30;

const EMPTY = {
  name: "",
  destination: "",
  net_adult_price: "",
  net_child_price: "",
  adult_price: "",
  child_price: "",
  park_fee_included: false,
  park_fee_adult: "",
  park_fee_child: "",
  short_description: "",
  description: "",
  main_image: "",
  highlights: "",
  included: "",
  not_included: "",
  min_participants: 1,
  max_participants: "",
  difficulty_level: "easy",
  rating: 0,
  terms_conditions: "",
  cancellation_policy: "",
  is_featured: false,
  is_active: true,
  pickup_time: "",
  pickup_location: "",
  dropoff_time: "",
  dropoff_location: "",
  departure_times: "",
  meal_info: "",
  transfer_info: "",
  what_to_bring: "",
  important_notes: "",
};

const linesToArray = (s) =>
  (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const arrayToLines = (a) => (Array.isArray(a) ? a.join("\n") : "");
const csvToArray = (s) =>
  (s || "").split(",").map((x) => x.trim()).filter(Boolean);

/** Map a tour record (as the API returns it) into form state. */
function tourToForm(tour) {
  return {
    ...EMPTY,
    name: tour.name || "",
    destination: tour.destination || "",
    net_adult_price: tour.net_adult_price ?? "",
    net_child_price: tour.net_child_price ?? "",
    adult_price: tour.adult_price ?? "",
    child_price: tour.child_price ?? "",
    park_fee_included: Number(tour.park_fee_included) === 1,
    park_fee_adult: tour.park_fee_adult ?? "",
    park_fee_child: tour.park_fee_child ?? "",
    short_description: tour.short_description || "",
    description: tour.description || "",
    main_image: tour.main_image || "",
    highlights: arrayToLines(tour.highlights),
    included: arrayToLines(tour.included),
    not_included: arrayToLines(tour.not_included),
    min_participants: tour.min_participants ?? 1,
    max_participants: tour.max_participants ?? "",
    difficulty_level: tour.difficulty_level || "easy",
    rating: tour.rating ?? 0,
    terms_conditions: tour.terms_conditions || "",
    cancellation_policy: tour.cancellation_policy || "",
    is_featured: Number(tour.is_featured) === 1,
    is_active: Number(tour.is_active) === 1,
    pickup_time: tour.pickup_time || "",
    pickup_location: tour.pickup_location || "",
    dropoff_time: tour.dropoff_time || "",
    dropoff_location: tour.dropoff_location || "",
    departure_times: Array.isArray(tour.departure_times)
      ? tour.departure_times.join(", ")
      : tour.departure_times || "",
    meal_info: tour.meal_info || "",
    transfer_info: tour.transfer_info || "",
    what_to_bring: Array.isArray(tour.what_to_bring)
      ? tour.what_to_bring.join("\n")
      : tour.what_to_bring || "",
    important_notes: tour.important_notes || "",
  };
}

// --- small presentational helpers, styled per docs/DESIGN_SYSTEM.md ---

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 font-body text-base text-gray-700 focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all";

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block font-body text-sm font-semibold text-navy mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-gray-400 font-normal text-xs"> {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function SectionCard({ title, right, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
      <div className="flex items-center mb-4">
        <h3 className="font-body text-base font-semibold text-navy">{title}</h3>
        {right && <span className="ml-auto text-xs text-gray-400">{right}</span>}
      </div>
      {children}
    </div>
  );
}

const TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "media", label: "Media" },
  { key: "details", label: "Details" },
  { key: "daytrip", label: "Trip Info" },
  { key: "settings", label: "Settings" },
];

/**
 * Full create/edit form for island tours. Faithful port of the legacy tour modal
 * (tour-modal.php + app-tours.js) — same tabs, fields, payload and upload flow.
 */
export default function TourFormModal({ tour, initialData, onClose, onSaved }) {
  const isEdit = Boolean(tour);
  // A create can be seeded (e.g. the Contract Rate importer) without becoming an edit.
  const seed = tour ?? initialData ?? null;
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(EMPTY);
  const [gallery, setGallery] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState("");
  const [mainUploading, setMainUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [openDays, setOpenDays] = useState(() => new Set());
  const dragIndex = useRef(null);
  const uidRef = useRef(0);
  const nextUid = () => ++uidRef.current;

  useEffect(() => {
    if (seed) {
      setForm(tourToForm(seed));
      setGallery(Array.isArray(seed.gallery_images) ? [...seed.gallery_images] : []);
      setItinerary(
        Array.isArray(seed.itinerary)
          ? seed.itinerary.map((d) => ({
              uid: nextUid(),
              title: d.title || "",
              time: d.time || "",
              description: d.description || "",
              activities: Array.isArray(d.activities) ? d.activities.join(", ") : "",
            }))
          : []
      );
    } else {
      setForm(EMPTY);
      setGallery([]);
      setItinerary([]);
    }
    setOpenDays(new Set());
    setTab("basic");
    setError("");
  }, [seed]);

  // Island tours are always one-day trips, so the itinerary is a schedule of
  // stops within that day rather than a day-by-day plan.
  const itemLabel = "Item";

  const set = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // --- image upload ---
  const onMainImage = async (files) => {
    if (!files || !files[0]) return;
    setMainUploading(true);
    try {
      const data = await uploadFile(files[0]);
      if (data.success) {
        setForm((f) => ({ ...f, main_image: data.data.url }));
      } else {
        setError("Upload failed: " + (data.message || "unknown error"));
      }
    } catch {
      setError("Upload error. Please try again.");
    } finally {
      setMainUploading(false);
    }
  };

  const onGalleryImages = async (files) => {
    if (!files || !files.length) return;
    if (gallery.length + files.length > GALLERY_MAX) {
      setError(`Maximum ${GALLERY_MAX} gallery images allowed.`);
      return;
    }
    setGalleryUploading(true);
    try {
      const data = await uploadFiles(files);
      if (data.success && data.data.urls) {
        setGallery((g) => [...g, ...data.data.urls]);
      }
      if (data.data?.errors?.length) {
        setError("Some uploads failed: " + data.data.errors.join(", "));
      }
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

  // --- itinerary ---
  const addDay = () => {
    const uid = nextUid();
    setItinerary((it) => [
      ...it,
      { uid, title: "", time: "", description: "", activities: "" },
    ]);
    setOpenDays((o) => new Set(o).add(uid)); // a fresh entry is empty — open it to fill in
  };
  const updateDay = (i, key, value) =>
    setItinerary((it) => it.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)));
  const removeDay = (i) => {
    const { uid } = itinerary[i];
    setItinerary((it) => it.filter((_, idx) => idx !== i));
    setOpenDays((o) => {
      const next = new Set(o);
      next.delete(uid);
      return next;
    });
  };
  const toggleDay = (uid) =>
    setOpenDays((o) => {
      const next = new Set(o);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });

  const buildPayload = () => {
    const num = (v) => {
      const n = parseFloat(v);
      return Number.isNaN(n) ? null : n;
    };
    return {
      name: form.name,
      destination: form.destination,
      type: tour?.type || "inbound",
      net_adult_price: num(form.net_adult_price),
      net_child_price: num(form.net_child_price),
      adult_price: parseFloat(form.adult_price),
      child_price: num(form.child_price),
      park_fee_included: form.park_fee_included ? 1 : 0,
      park_fee_adult: num(form.park_fee_adult),
      park_fee_child: num(form.park_fee_child),
      duration_days: 1,
      duration_nights: 0,
      duration_label: "One Day Trip",
      currency: "THB",
      description: form.description,
      short_description: form.short_description,
      main_image: form.main_image,
      gallery_images: gallery,
      highlights: linesToArray(form.highlights),
      included: linesToArray(form.included),
      not_included: linesToArray(form.not_included),
      itinerary: itinerary.map((d, i) => ({
        day: i + 1,
        title: d.title.trim() || `${itemLabel} ${i + 1}`,
        time: d.time.trim(),
        description: d.description.trim(),
        activities: csvToArray(d.activities),
      })),
      max_participants: parseInt(form.max_participants, 10) || null,
      min_participants: parseInt(form.min_participants, 10) || 1,
      difficulty_level: form.difficulty_level,
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
      departure_times: form.departure_times ? csvToArray(form.departure_times) : null,
      meal_info: form.meal_info || null,
      transfer_info: form.transfer_info || null,
      what_to_bring: form.what_to_bring ? linesToArray(form.what_to_bring) : null,
      important_notes: form.important_notes || null,
      source_tour_id: seed?.source_tour_id ?? null,
      source_supplier_name: seed?.source_supplier_name ?? null,
    };
  };

  // Required fields all live on the Basic tab — jump there if any are missing.
  const validate = () => {
    const required = [
      ["name", "Tour Name"],
      ["destination", "Destination"],
      ["adult_price", "Adult Price"],
      ["description", "Full Description"],
    ];
    for (const [key, label] of required) {
      if (form[key] === "" || form[key] === null || form[key] === undefined) {
        setTab("basic");
        setError(`Please fill in "${label}"`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");
    try {
      const path = isEdit ? `tours.php?id=${tour.id}` : "tours.php";
      const data = await apiJson(path, isEdit ? "PUT" : "POST", buildPayload());
      if (data.success) {
        onSaved(isEdit ? "Tour updated successfully!" : "Tour created successfully!");
      } else {
        setError("Error: " + (data.message || "could not save tour"));
      }
    } catch {
      setError("Error saving tour. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!validate()) return;
    if (!window.confirm(`Create a copy of "${form.name}"?`)) return;

    setDuplicating(true);
    setError("");
    try {
      const payload = { ...buildPayload(), name: `${form.name} (Copy)`, is_active: 0 };
      const data = await apiJson("tours.php", "POST", payload);
      if (data.success) {
        onSaved("Tour duplicated! The copy is inactive — review it before publishing.");
      } else {
        setError("Error: " + (data.message || "could not duplicate tour"));
      }
    } catch {
      setError("Error duplicating tour. Please try again.");
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">
              {isEdit ? "Edit Island Tour" : "Add New Island Tour"}
            </h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">
              {isEdit
                ? "Update the island tour details"
                : "Fill in the details to create an island tour"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap px-6 bg-gray-50 border-b border-gray-100 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-3 font-body text-sm font-semibold border-b-2 transition-all ${
                tab === t.key
                  ? "text-navy border-navy"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form
          id="tourForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6"
        >
          {/* Basic */}
          {tab === "basic" && (
            <div>
              <SectionCard title="Tour Identity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Tour Name" required>
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. Phi Phi Island Adventure"
                    />
                  </Field>
                  <Field label="Destination" required>
                    <input
                      className={inputClass}
                      value={form.destination}
                      onChange={set("destination")}
                      list="admin-destinations"
                      placeholder="e.g. Krabi, Thailand"
                    />
                    <datalist id="admin-destinations">
                      {THAI_DESTINATIONS.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title="Pricing">
                <p className="text-xs text-gray-400 mb-3">
                  Net is what the tour costs us — internal only, never shown on the
                  website. Agent rates are built on top of it.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Net Adult Price">
                    <PriceInput className={inputClass} value={form.net_adult_price} onChange={setValue("net_adult_price")} />
                  </Field>
                  <Field label="Net Child Price">
                    <PriceInput className={inputClass} value={form.net_child_price} onChange={setValue("net_child_price")} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Selling Adult Price" required>
                    <PriceInput className={inputClass} value={form.adult_price} onChange={setValue("adult_price")} />
                    <MarginHint net={form.net_adult_price} selling={form.adult_price} />
                  </Field>
                  <Field label="Selling Child Price">
                    <PriceInput className={inputClass} value={form.child_price} onChange={setValue("child_price")} />
                    <MarginHint net={form.net_child_price} selling={form.child_price} />
                  </Field>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input type="checkbox" checked={form.park_fee_included} onChange={set("park_fee_included")} />
                    <span className="font-body text-sm font-semibold text-navy">
                      National park fee already included in the prices above
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Park Fee — Adult">
                      <PriceInput className={inputClass} value={form.park_fee_adult} onChange={setValue("park_fee_adult")} />
                    </Field>
                    <Field label="Park Fee — Child">
                      <PriceInput className={inputClass} value={form.park_fee_child} onChange={setValue("park_fee_child")} />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Description">
                <div className="mb-4">
                  <Field label="Short Description" hint="(shown on cards)">
                    <input className={inputClass} value={form.short_description} onChange={set("short_description")} maxLength={120} placeholder="Brief one-liner for tour cards" />
                  </Field>
                </div>
                <Field label="Full Description" required>
                  <textarea rows={5} className={`${inputClass} resize-y`} value={form.description} onChange={set("description")} placeholder="Describe the full tour experience..." />
                </Field>
              </SectionCard>
            </div>
          )}

          {/* Media */}
          {tab === "media" && (
            <div>
              <SectionCard title="Cover Image" right="Tour thumbnail">
                {form.main_image ? (
                  <div className="relative inline-block">
                    <img src={form.main_image} alt="Main" className="max-h-48 rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, main_image: "" }))} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-lg leading-none">&times;</button>
                  </div>
                ) : (
                  <label className="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[140px] flex flex-col items-center justify-center">
                    <p className="font-body text-sm font-medium text-gray-500">
                      {mainUploading ? "Uploading..." : "Click to upload cover image"}
                    </p>
                    <small className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB) • 1200×800</small>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onMainImage(e.target.files)} />
                  </label>
                )}
              </SectionCard>

              <SectionCard title="Gallery" right={`${gallery.length} / ${GALLERY_MAX} images`}>
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {gallery.map((url, i) => (
                    <div
                      key={url + i}
                      draggable
                      onDragStart={() => (dragIndex.current = i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onGalleryDrop(i)}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-grab"
                    >
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                      <button type="button" onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none">&times;</button>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <label className="dropzone border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all flex flex-col items-center justify-center">
                  <p className="font-body text-sm font-medium text-gray-500">
                    {galleryUploading ? "Uploading..." : "Click to upload multiple images"}
                  </p>
                  <small className="text-xs text-gray-400 mt-1">Drag thumbnails to reorder</small>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onGalleryImages(e.target.files)} />
                </label>
              </SectionCard>
            </div>
          )}

          {/* Details */}
          {tab === "details" && (
            <div>
              <SectionCard title="Highlights">
                <Field label="Key Highlights" hint="(one per line)">
                  <textarea rows={4} className={`${inputClass} resize-y`} value={form.highlights} onChange={set("highlights")} placeholder={"Phi Phi Islands\nSnorkeling\nBeach BBQ"} />
                </Field>
              </SectionCard>
              <SectionCard title="Inclusions">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Included" hint="(one per line)">
                    <textarea rows={5} className={`${inputClass} resize-y`} value={form.included} onChange={set("included")} placeholder={"Hotel accommodation\nAll meals\nTransportation"} />
                  </Field>
                  <Field label="Not Included" hint="(one per line)">
                    <textarea rows={5} className={`${inputClass} resize-y`} value={form.not_included} onChange={set("not_included")} placeholder={"International flights\nPersonal expenses"} />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard
                title="Schedule"
                right={`${itinerary.length} ${itinerary.length === 1 ? "item" : "items"}`}
              >
                <div className="flex flex-col gap-3">
                  {itinerary.map((d, i) => {
                    const open = openDays.has(d.uid);
                    const summary = [d.time, d.title].filter(Boolean).join(" — ");
                    return (
                      <div key={d.uid} className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center gap-3 p-4">
                          <button
                            type="button"
                            onClick={() => toggleDay(d.uid)}
                            aria-expanded={open}
                            className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                          >
                            <svg
                              className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <span className="font-body text-sm font-semibold text-navy shrink-0">
                              {itemLabel} {i + 1}
                            </span>
                            {!open && summary && (
                              <span className="font-body text-sm text-gray-400 truncate">{summary}</span>
                            )}
                          </button>
                          <button type="button" onClick={() => removeDay(i)} className="text-sm text-red-600 hover:underline shrink-0">Remove</button>
                        </div>
                        {open && (
                          <div className="px-4 pb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <Field label="Title">
                                <input className={inputClass} value={d.title} onChange={(e) => updateDay(i, "title", e.target.value)} placeholder="e.g. Maya Bay" />
                              </Field>
                              <Field label="Time">
                                <input className={inputClass} value={d.time} onChange={(e) => updateDay(i, "time", e.target.value)} placeholder="e.g. 09:00 - 10:30" />
                              </Field>
                            </div>
                            <div className="mb-3">
                              <Field label="Description">
                                <textarea rows={2} className={`${inputClass} resize-y`} value={d.description} onChange={(e) => updateDay(i, "description", e.target.value)} placeholder="Describe this stop..." />
                              </Field>
                            </div>
                            <Field label="Activities" hint="(comma-separated)">
                              <input className={inputClass} value={d.activities} onChange={(e) => updateDay(i, "activities", e.target.value)} placeholder="Temple visit, Lunch, Beach" />
                            </Field>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={addDay} className="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-gray-400 hover:border-navy hover:text-navy hover:bg-navy/[0.02] transition-all">
                  + Add {itemLabel}
                </button>
              </SectionCard>
            </div>
          )}

          {/* One Day Trip */}
          {tab === "daytrip" && (
            <div>
              <SectionCard title="Pickup & Dropoff">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Pickup Time">
                    <input className={inputClass} value={form.pickup_time} onChange={set("pickup_time")} placeholder="e.g. 07:30 AM" />
                  </Field>
                  <Field label="Pickup Location">
                    <input className={inputClass} value={form.pickup_location} onChange={set("pickup_location")} placeholder="e.g. Hotel Lobby" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Dropoff Time">
                    <input className={inputClass} value={form.dropoff_time} onChange={set("dropoff_time")} placeholder="e.g. 06:00 PM" />
                  </Field>
                  <Field label="Dropoff Location">
                    <input className={inputClass} value={form.dropoff_location} onChange={set("dropoff_location")} placeholder="e.g. Same as pickup" />
                  </Field>
                </div>
                <Field label="Available Departure Times" hint="(comma-separated)">
                  <input className={inputClass} value={form.departure_times} onChange={set("departure_times")} placeholder="07:30, 08:00, 09:00" />
                </Field>
              </SectionCard>
              <SectionCard title="Service Info">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Meal Info">
                    <input className={inputClass} value={form.meal_info} onChange={set("meal_info")} placeholder="e.g. Lunch included" />
                  </Field>
                  <Field label="Transfer Info">
                    <input className={inputClass} value={form.transfer_info} onChange={set("transfer_info")} placeholder="e.g. Round-trip transfer" />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Additional Info">
                <div className="mb-4">
                  <Field label="What to Bring" hint="(one per line)">
                    <textarea rows={4} className={`${inputClass} resize-y`} value={form.what_to_bring} onChange={set("what_to_bring")} placeholder={"Sunscreen\nSwimsuit\nCamera"} />
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
              <SectionCard title="Capacity & Difficulty">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Min Participants">
                    <input type="number" min="1" className={inputClass} value={form.min_participants} onChange={set("min_participants")} />
                  </Field>
                  <Field label="Max Participants">
                    <input type="number" min="1" className={inputClass} value={form.max_participants} onChange={set("max_participants")} placeholder="20" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Difficulty Level">
                    <select className={inputClass} value={form.difficulty_level} onChange={set("difficulty_level")}>
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                    </select>
                  </Field>
                  <Field label="Rating (0-5)">
                    <input type="number" min="0" max="5" step="0.1" className={inputClass} value={form.rating} onChange={set("rating")} />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Policies">
                <div className="mb-4">
                  <Field label="Terms & Conditions">
                    <textarea rows={4} className={`${inputClass} resize-y`} value={form.terms_conditions} onChange={set("terms_conditions")} placeholder="Booking terms and conditions..." />
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
                    <span className="font-body text-sm font-semibold text-gray-700">Featured Tour</span>
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="font-body text-sm text-red-600">{error}</div>
          <div className="flex gap-3">
            {isEdit && (
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={saving || duplicating}
                title="Save these details as a new, inactive tour"
                className="px-5 py-2.5 font-body text-sm font-semibold text-navy bg-white border-2 border-navy rounded-xl hover:bg-navy hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {duplicating ? "Duplicating..." : "Duplicate"}
              </button>
            )}
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button type="submit" form="tourForm" disabled={saving || duplicating} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Tour"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
