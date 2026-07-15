import { useEffect, useMemo, useRef, useState } from "react";
import { apiJson, uploadFile, uploadFiles } from "./lib/adminApi";
import { inputClass, Field, SectionCard } from "./lib/formUi";

const PRESET_CATEGORIES = ["Exterior", "Lobby", "Bedroom", "Bathroom", "Restaurant", "Pool", "Spa", "Gym", "View"];
const BED_TYPES = ["King", "Queen", "Twin", "Double", "Single", "Bunk"];

const EMPTY = {
  name: "", destination: "", stars: 4,
  description: "", short_description: "",
  address: "", contact_phone: "", contact_email: "", website: "",
  check_in_time: "", check_out_time: "",
  main_image: "",
  rating: 0, review_count: 0,
  amenities: "",
  is_featured: false, is_active: true,
};

const linesToArray = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const csvToArray = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);

function hotelToForm(h) {
  return {
    ...EMPTY,
    name: h.name || "", destination: h.destination || "", stars: h.stars ?? 4,
    description: h.description || "", short_description: h.short_description || "",
    address: h.address || "", contact_phone: h.contact_phone || "",
    contact_email: h.contact_email || "", website: h.website || "",
    check_in_time: h.check_in_time || "", check_out_time: h.check_out_time || "",
    main_image: h.main_image || "",
    rating: h.rating ?? 0, review_count: h.review_count ?? 0,
    amenities: Array.isArray(h.amenities) ? h.amenities.join("\n") : "",
    is_featured: Number(h.is_featured) === 1, is_active: Number(h.is_active) === 1,
  };
}

const TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "media", label: "Media" },
  { key: "rooms", label: "Room Types" },
  { key: "settings", label: "Settings" },
];

/**
 * Create/edit a hotel. Faithful port of the legacy hotel modal — same tabs, the
 * category-grouped gallery (bulk category / delete, drag reorder) and room-type
 * builder, and the same payload shape.
 */
export default function HotelFormModal({ hotel, destinations, onClose, onSaved }) {
  const isEdit = Boolean(hotel);
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(EMPTY);
  const [gallery, setGallery] = useState([]); // { image_url, category, caption }[]
  const [rooms, setRooms] = useState([]); // { name, bed_type, max_guests, room_size, description, amenities }[]
  const [selected, setSelected] = useState(() => new Set()); // gallery indexes
  const [uploadCategory, setUploadCategory] = useState("Uncategorized");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mainUploading, setMainUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    if (hotel) {
      setForm(hotelToForm(hotel));
      setGallery(
        Array.isArray(hotel.images)
          ? hotel.images.map((img) => ({ image_url: img.image_url, category: img.category || "Uncategorized", caption: img.caption || "" }))
          : []
      );
      setRooms(
        Array.isArray(hotel.room_types)
          ? hotel.room_types.map((r) => ({
              name: r.name || "", bed_type: r.bed_type || "",
              max_guests: r.max_guests ?? 2, room_size: r.room_size ?? "",
              description: r.description || "",
              amenities: Array.isArray(r.amenities) ? r.amenities.join(", ") : "",
            }))
          : []
      );
    } else {
      setForm(EMPTY);
      setGallery([]);
      setRooms([]);
    }
    setSelected(new Set());
    setTab("basic");
    setError("");
  }, [hotel]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  // --- category options for the gallery (presets + room names + custom in use) ---
  const roomNames = useMemo(() => rooms.map((r) => r.name.trim()).filter(Boolean), [rooms]);
  const categoryOptions = useMemo(() => {
    const used = new Set(gallery.map((g) => g.category));
    const custom = [...used].filter((c) => c && c !== "Uncategorized" && !PRESET_CATEGORIES.includes(c) && !roomNames.includes(c));
    return { presets: PRESET_CATEGORIES, rooms: roomNames, custom };
  }, [gallery, roomNames]);

  const resolveUploadCategory = () => {
    if (uploadCategory === "__custom__") return customCategory.trim() || "Uncategorized";
    return uploadCategory;
  };

  // --- image uploads ---
  const onMainImage = async (files) => {
    if (!files?.[0]) return;
    setMainUploading(true);
    try {
      const data = await uploadFile(files[0]);
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
    const category = resolveUploadCategory();
    setGalleryUploading(true);
    try {
      const data = await uploadFiles(files);
      if (data.success && data.data.urls) {
        setGallery((g) => [...g, ...data.data.urls.map((url) => ({ image_url: url, category, caption: "" }))]);
      }
      if (data.data?.errors?.length) setError("Some uploads failed: " + data.data.errors.join(", "));
    } catch {
      setError("Upload error. Please try again.");
    } finally {
      setGalleryUploading(false);
    }
  };

  // --- gallery selection / bulk ops ---
  const toggleSelect = (index) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const applyCategory = (category) => {
    if (!category) return;
    setGallery((g) => g.map((img, i) => (selected.has(i) ? { ...img, category } : img)));
    setSelected(new Set());
  };

  const deleteSelected = () => {
    if (!window.confirm(`Delete ${selected.size} selected image(s)?`)) return;
    setGallery((g) => g.filter((_, i) => !selected.has(i)));
    setSelected(new Set());
  };

  const removeImage = (index) => {
    setGallery((g) => g.filter((_, i) => i !== index));
    setSelected(new Set());
  };

  const onGalleryDrop = (targetIndex) => {
    const from = dragIndex.current;
    if (from === null || from === targetIndex) return;
    setGallery((g) => {
      const next = [...g];
      const targetCategory = next[targetIndex]?.category;
      const [item] = next.splice(from, 1);
      if (targetCategory) item.category = targetCategory;
      next.splice(targetIndex, 0, item);
      return next;
    });
    dragIndex.current = null;
    setSelected(new Set());
  };

  // --- room builder ---
  const addRoom = () => setRooms((r) => [...r, { name: "", bed_type: "", max_guests: 2, room_size: "", description: "", amenities: "" }]);
  const updateRoom = (i, key, value) => setRooms((r) => r.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
  const removeRoom = (i) => setRooms((r) => r.filter((_, idx) => idx !== i));

  // grouped gallery view (keeps original indexes)
  const grouped = useMemo(() => {
    const groups = {};
    gallery.forEach((img, index) => {
      const cat = img.category || "Uncategorized";
      (groups[cat] ||= []).push({ ...img, _index: index });
    });
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Uncategorized") return -1;
      if (b[0] === "Uncategorized") return 1;
      return a[0].localeCompare(b[0]);
    });
  }, [gallery]);

  const buildPayload = () => ({
    name: form.name,
    destination: form.destination,
    stars: parseInt(form.stars, 10) || 0,
    description: form.description,
    short_description: form.short_description,
    address: form.address || null,
    contact_phone: form.contact_phone || null,
    contact_email: form.contact_email || null,
    website: form.website || null,
    check_in_time: form.check_in_time || null,
    check_out_time: form.check_out_time || null,
    main_image: form.main_image,
    rating: parseFloat(form.rating) || 0,
    review_count: parseInt(form.review_count, 10) || 0,
    amenities: linesToArray(form.amenities),
    is_featured: form.is_featured ? 1 : 0,
    is_active: form.is_active ? 1 : 0,
    images: gallery.map((img, index) => ({ ...img, sort_order: index })),
    room_types: rooms
      .filter((r) => r.name.trim())
      .map((r, index) => ({
        name: r.name.trim(),
        description: r.description.trim() || null,
        max_guests: parseInt(r.max_guests, 10) || 2,
        bed_type: r.bed_type || null,
        room_size: parseFloat(r.room_size) || null,
        amenities: csvToArray(r.amenities),
        sort_order: index,
      })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [key, label] of [["name", "Hotel Name"], ["destination", "Destination"], ["description", "Full Description"]]) {
      if (!form[key] || !String(form[key]).trim()) {
        setTab("basic");
        setError(`Please fill in "${label}"`);
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      const path = isEdit ? `hotels.php?id=${hotel.id}` : "hotels.php";
      const data = await apiJson(path, isEdit ? "PUT" : "POST", buildPayload());
      if (data.success) onSaved(isEdit ? "Hotel updated successfully!" : "Hotel created successfully!");
      else setError("Error: " + (data.message || "could not save hotel"));
    } catch {
      setError("Error saving hotel. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const catSelectClass = "px-3 py-2 rounded-lg border border-gray-200 font-body text-sm text-gray-700 bg-white focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-body text-xl font-semibold text-navy">{isEdit ? "Edit Hotel" : "Add New Hotel"}</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">{isEdit ? "Update the hotel property details" : "Fill in the details to add a hotel property"}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
        </div>

        <div className="flex flex-wrap px-6 bg-gray-50 border-b border-gray-100 gap-1">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`shrink-0 px-4 py-3 font-body text-sm font-semibold border-b-2 transition-all ${tab === t.key ? "text-navy border-navy" : "text-gray-400 border-transparent hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form id="hotelForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic */}
          {tab === "basic" && (
            <div>
              <SectionCard title="Hotel Identity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Hotel Name" required>
                    <input className={inputClass} value={form.name} onChange={set("name")} placeholder="e.g. The Naka Island Resort" />
                  </Field>
                  <Field label="Destination" required>
                    <input className={inputClass} value={form.destination} onChange={set("destination")} list="admin-destinations" placeholder="e.g. Phuket, Thailand" />
                    <datalist id="admin-destinations">
                      {(destinations || []).map((d) => <option key={d} value={d} />)}
                    </datalist>
                  </Field>
                </div>
                <Field label="Stars">
                  <select className={inputClass} value={form.stars} onChange={set("stars")}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Star{n === 1 ? "" : "s"}</option>)}
                  </select>
                </Field>
              </SectionCard>

              <SectionCard title="Description">
                <div className="mb-4">
                  <Field label="Short Description" hint="(shown on cards)">
                    <input className={inputClass} value={form.short_description} onChange={set("short_description")} maxLength={160} placeholder="Brief one-liner" />
                  </Field>
                </div>
                <Field label="Full Description" required>
                  <textarea rows={5} className={`${inputClass} resize-y`} value={form.description} onChange={set("description")} placeholder="Describe the property..." />
                </Field>
              </SectionCard>

              <SectionCard title="Contact & Location">
                <div className="mb-4">
                  <Field label="Address">
                    <input className={inputClass} value={form.address} onChange={set("address")} placeholder="Full address" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Contact Phone"><input className={inputClass} value={form.contact_phone} onChange={set("contact_phone")} placeholder="+66..." /></Field>
                  <Field label="Contact Email"><input type="email" className={inputClass} value={form.contact_email} onChange={set("contact_email")} placeholder="reservations@hotel.com" /></Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Website"><input className={inputClass} value={form.website} onChange={set("website")} placeholder="https://..." /></Field>
                  <div />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Check-in Time"><input className={inputClass} value={form.check_in_time} onChange={set("check_in_time")} placeholder="14:00" /></Field>
                  <Field label="Check-out Time"><input className={inputClass} value={form.check_out_time} onChange={set("check_out_time")} placeholder="12:00" /></Field>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Media */}
          {tab === "media" && (
            <div>
              <SectionCard title="Cover Image">
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

              <SectionCard title="Gallery Images" right={`${gallery.length} images`}>
                {/* Upload row with category */}
                <div className="flex flex-wrap items-end gap-3 mb-4">
                  <div>
                    <label className="block font-body text-sm font-semibold text-navy mb-1.5">Category</label>
                    <select className={catSelectClass} value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                      <option value="Uncategorized">Uncategorized</option>
                      <optgroup label="General">
                        {categoryOptions.presets.map((c) => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      {categoryOptions.rooms.length > 0 && (
                        <optgroup label="Room Types">
                          {categoryOptions.rooms.map((c) => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                      )}
                      {categoryOptions.custom.length > 0 && (
                        <optgroup label="Custom">
                          {categoryOptions.custom.map((c) => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                      )}
                      <option value="__custom__">+ New category...</option>
                    </select>
                  </div>
                  {uploadCategory === "__custom__" && (
                    <input className={catSelectClass} value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="New category name" />
                  )}
                  <label className="px-4 py-2 rounded-lg bg-navy text-white font-body text-sm font-semibold cursor-pointer hover:bg-navy/90 transition-all">
                    {galleryUploading ? "Uploading..." : "Upload Images"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onGalleryImages(e.target.files)} />
                  </label>
                </div>

                {/* Bulk bar */}
                {selected.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mb-4 rounded-xl bg-navy/5 border border-navy/10 px-4 py-2.5">
                    <span className="font-body text-sm font-semibold text-navy">{selected.size} selected</span>
                    <select className={`${catSelectClass} !py-1.5 !text-xs`} defaultValue="" onChange={(e) => { applyCategory(e.target.value === "__custom__" ? (window.prompt("New category name:") || "").trim() : e.target.value); e.target.value = ""; }}>
                      <option value="" disabled>Apply category…</option>
                      <option value="Uncategorized">Uncategorized</option>
                      {categoryOptions.presets.map((c) => <option key={c} value={c}>{c}</option>)}
                      {categoryOptions.rooms.map((c) => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom__">+ New category...</option>
                    </select>
                    <button type="button" onClick={() => setSelected(new Set())} className="px-3 py-1.5 font-body text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Deselect</button>
                    <button type="button" onClick={deleteSelected} className="ml-auto px-3 py-1.5 font-body text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Delete Selected</button>
                  </div>
                )}

                {/* Grouped gallery */}
                {gallery.length === 0 ? (
                  <p className="font-body text-sm text-gray-400 text-center py-6">No gallery images yet. Upload photos above.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {grouped.map(([category, images]) => (
                      <div key={category} className={`border rounded-xl overflow-hidden ${category === "Uncategorized" ? "border-amber-200" : "border-gray-100"}`}>
                        <div className={`px-4 py-2.5 flex items-center justify-between ${category === "Uncategorized" ? "bg-amber-50" : "bg-gray-50"}`}>
                          <span className={`font-body text-sm font-semibold ${category === "Uncategorized" ? "text-amber-700" : "text-navy"}`}>{category}</span>
                          <span className="font-body text-xs text-gray-400">{images.length} photo{images.length === 1 ? "" : "s"}</span>
                        </div>
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {images.map((img) => (
                            <div
                              key={img._index}
                              draggable
                              onDragStart={() => (dragIndex.current = img._index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => onGalleryDrop(img._index)}
                              onClick={() => toggleSelect(img._index)}
                              className={`relative rounded-lg overflow-hidden border-2 cursor-pointer ${selected.has(img._index) ? "border-navy" : "border-transparent"}`}
                            >
                              <img src={img.image_url} alt={img.caption || category} className="w-full h-24 object-cover pointer-events-none" />
                              <input type="checkbox" checked={selected.has(img._index)} readOnly className="absolute top-1.5 left-1.5 w-4 h-4 pointer-events-none" />
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(img._index); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white text-xs">&times;</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* Rooms */}
          {tab === "rooms" && (
            <SectionCard title="Room Types" right={`${rooms.length} room type${rooms.length === 1 ? "" : "s"}`}>
              <div className="flex flex-col gap-3">
                {rooms.map((room, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-body text-sm font-semibold text-navy">Room Type {i + 1}</span>
                      <button type="button" onClick={() => removeRoom(i)} className="text-sm text-red-600 hover:underline">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label="Room Name" required>
                        <input className={inputClass} value={room.name} onChange={(e) => updateRoom(i, "name", e.target.value)} placeholder="e.g. Deluxe Ocean View" />
                      </Field>
                      <Field label="Bed Type">
                        <select className={inputClass} value={room.bed_type} onChange={(e) => updateRoom(i, "bed_type", e.target.value)}>
                          <option value="">Select...</option>
                          {BED_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label="Max Guests"><input type="number" min="1" className={inputClass} value={room.max_guests} onChange={(e) => updateRoom(i, "max_guests", e.target.value)} /></Field>
                      <Field label="Room Size (sqm)"><input type="number" min="0" step="0.1" className={inputClass} value={room.room_size} onChange={(e) => updateRoom(i, "room_size", e.target.value)} placeholder="32" /></Field>
                    </div>
                    <div className="mb-3">
                      <Field label="Description"><textarea rows={2} className={`${inputClass} resize-y`} value={room.description} onChange={(e) => updateRoom(i, "description", e.target.value)} placeholder="Describe this room type..." /></Field>
                    </div>
                    <Field label="Amenities" hint="(comma-separated)">
                      <input className={inputClass} value={room.amenities} onChange={(e) => updateRoom(i, "amenities", e.target.value)} placeholder="WiFi, TV, Minibar, Balcony" />
                    </Field>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addRoom} className="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-gray-400 hover:border-navy hover:text-navy transition-all">+ Add Room Type</button>
            </SectionCard>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div>
              <SectionCard title="Ratings">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Rating (0-5)"><input type="number" min="0" max="5" step="0.1" className={inputClass} value={form.rating} onChange={set("rating")} /></Field>
                  <Field label="Review Count"><input type="number" min="0" className={inputClass} value={form.review_count} onChange={set("review_count")} /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Hotel Amenities">
                <Field label="Amenities" hint="(one per line)">
                  <textarea rows={5} className={`${inputClass} resize-y`} value={form.amenities} onChange={set("amenities")} placeholder={"Free WiFi\nSwimming Pool\nSpa\nFitness Center"} />
                </Field>
              </SectionCard>
              <SectionCard title="Visibility">
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={set("is_featured")} />
                  <div>
                    <span className="font-body text-sm font-semibold text-gray-700">Featured Hotel</span>
                    <p className="text-xs text-gray-400">Show in the featured section on homepage</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={set("is_active")} />
                  <div>
                    <span className="font-body text-sm font-semibold text-gray-700">Active</span>
                    <p className="text-xs text-gray-400">Visible on the website</p>
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
            <button type="submit" form="hotelForm" disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Hotel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
