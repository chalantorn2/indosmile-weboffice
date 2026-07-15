import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiMutate, apiJson, formatCurrency, uploadFile } from "./lib/adminApi";
import { inputClass, Field } from "./lib/formUi";

const TABS = [
  { key: "routes", label: "Routes" },
  { key: "locations", label: "Locations" },
  { key: "vehicles", label: "Vehicles" },
  { key: "gallery", label: "Page Gallery" },
];

// Every transfer list endpoint wraps items as { data: [...], total }.
const listItems = (path) => apiGet(path).then((d) => d?.data || []);

const modalWrap = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4";
const modalCard = "bg-white w-full rounded-2xl shadow-xl flex flex-col overflow-hidden";
const activeBadge = (on) =>
  on ? (
    <span className="rounded-full bg-green-50 text-green-600 px-2.5 py-1 text-xs font-semibold">Active</span>
  ) : (
    <span className="rounded-full bg-red-50 text-red-600 px-2.5 py-1 text-xs font-semibold">Inactive</span>
  );

const th = "font-body text-sm font-semibold px-4 py-3";
const td = "px-4 py-3 font-body text-sm text-gray-700";
const editBtn = "px-3 py-1.5 font-body text-sm font-semibold text-navy border-2 border-navy rounded-lg hover:bg-navy hover:text-white transition-all";
const delBtn = "px-3 py-1.5 font-body text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all";
const addBtn = "bg-yellow text-navy font-body font-semibold px-5 py-2.5 rounded-xl hover:brightness-95 focus:ring-2 focus:ring-navy/20 focus:outline-none transition-all";

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <h2 className="font-body text-xl font-semibold text-navy">{title}</h2>
      <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl leading-none">&times;</button>
    </div>
  );
}

function ModalFooter({ onClose, saving, label = "Save" }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
      <button type="button" onClick={onClose} className="px-5 py-2.5 font-body text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
      <button type="submit" disabled={saving} className="px-6 py-2.5 font-body text-sm font-semibold text-navy bg-yellow rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

// ─── Locations ────────────────────────────────────────────────────
function LocationModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState({ name: item?.name || "", sort_order: item?.sort_order ?? 0, is_active: item ? Number(item.is_active) === 1 : true });
  const mutation = useMutation({
    mutationFn: (payload) => apiMutate(isEdit ? `transfers.php?resource=locations&id=${item.id}` : "transfers.php?resource=locations", isEdit ? "PUT" : "POST", payload),
    onSuccess: () => onSaved(isEdit ? "Location updated" : "Location created"),
    onError: (err) => toast.error(err.message || "Failed to save"),
  });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("Enter a location name");
    mutation.mutate({ name: form.name.trim(), sort_order: parseInt(form.sort_order, 10) || 0, is_active: form.is_active ? 1 : 0 });
  };
  return (
    <div className={modalWrap}>
      <form onSubmit={submit} className={`${modalCard} max-w-md`}>
        <ModalHeader title={isEdit ? "Edit Location" : "Add New Location"} onClose={onClose} />
        <div className="p-6 flex flex-col gap-4">
          <Field label="Name" required><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Phuket Airport" /></Field>
          <Field label="Sort Order"><input type="number" className={inputClass} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span className="font-body text-sm font-semibold text-gray-700">Active</span>
          </label>
        </div>
        <ModalFooter onClose={onClose} saving={mutation.isPending} />
      </form>
    </div>
  );
}

// ─── Vehicles ─────────────────────────────────────────────────────
function VehicleModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState({
    name: item?.name || "", max_passengers: item?.max_passengers ?? 1, max_luggage: item?.max_luggage ?? 2,
    sort_order: item?.sort_order ?? 0, description: item?.description || "", image_url: item?.image_url || "",
    is_active: item ? Number(item.is_active) === 1 : true,
  });
  const [uploading, setUploading] = useState(false);
  const mutation = useMutation({
    mutationFn: (payload) => apiMutate(isEdit ? `transfers.php?resource=vehicles&id=${item.id}` : "transfers.php?resource=vehicles", isEdit ? "PUT" : "POST", payload),
    onSuccess: () => onSaved(isEdit ? "Vehicle updated" : "Vehicle created"),
    onError: (err) => toast.error(err.message || "Failed to save"),
  });
  const onImage = async (files) => {
    if (!files?.[0]) return;
    setUploading(true);
    try {
      const data = await uploadFile(files[0], "transfers");
      const url = data.data?.url || data.url;
      if (data.success && url) setForm((f) => ({ ...f, image_url: url }));
      else toast.error(data.message || "Upload failed");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("Enter a vehicle name");
    mutation.mutate({
      name: form.name.trim(), max_passengers: parseInt(form.max_passengers, 10) || 1, max_luggage: parseInt(form.max_luggage, 10) || 0,
      sort_order: parseInt(form.sort_order, 10) || 0, description: form.description.trim(), image_url: form.image_url || null, is_active: form.is_active ? 1 : 0,
    });
  };
  return (
    <div className={modalWrap}>
      <form onSubmit={submit} className={`${modalCard} max-w-lg max-h-[92vh]`}>
        <ModalHeader title={isEdit ? "Edit Vehicle" : "Add New Vehicle"} onClose={onClose} />
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <Field label="Name" required><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Toyota Commuter Van" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Max Passengers"><input type="number" min="1" className={inputClass} value={form.max_passengers} onChange={(e) => setForm({ ...form, max_passengers: e.target.value })} /></Field>
            <Field label="Max Luggage"><input type="number" min="0" className={inputClass} value={form.max_luggage} onChange={(e) => setForm({ ...form, max_luggage: e.target.value })} /></Field>
          </div>
          <Field label="Sort Order"><input type="number" className={inputClass} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={2} className={`${inputClass} resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" /></Field>
          <Field label="Image">
            {form.image_url ? (
              <div className="relative inline-block">
                <img src={form.image_url} alt="Vehicle" className="max-h-28 rounded-lg border border-gray-200" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: "" }))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm leading-none">&times;</button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-navy/40 transition-all flex items-center justify-center">
                <span className="font-body text-sm text-gray-500">{uploading ? "Uploading..." : "Click to upload"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onImage(e.target.files)} />
              </label>
            )}
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span className="font-body text-sm font-semibold text-gray-700">Active</span>
          </label>
        </div>
        <ModalFooter onClose={onClose} saving={mutation.isPending} />
      </form>
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────
function RouteModal({ item, locations, vehicles, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const activeLocations = locations.filter((l) => Number(l.is_active) === 1);
  const activeVehicles = vehicles.filter((v) => Number(v.is_active) === 1);
  const [originId, setOriginId] = useState(item?.origin_id ? String(item.origin_id) : "");
  const [destId, setDestId] = useState(item?.destination_id ? String(item.destination_id) : "");
  const [isActive, setIsActive] = useState(item ? Number(item.is_active) === 1 : true);
  const [prices, setPrices] = useState(() => {
    const map = {};
    (item?.prices || []).forEach((p) => (map[p.vehicle_id] = p.price));
    return map;
  });

  const mutation = useMutation({
    mutationFn: (payload) => apiMutate(isEdit ? `transfers.php?resource=routes&id=${item.id}` : "transfers.php?resource=routes", isEdit ? "PUT" : "POST", payload),
    onSuccess: () => onSaved(isEdit ? "Route updated" : "Route created"),
    onError: (err) => toast.error(err.message || "Failed to save route"),
  });

  const submit = (e) => {
    e.preventDefault();
    const o = parseInt(originId, 10);
    const d = parseInt(destId, 10);
    if (!o || !d) return toast.warning("Select both origin and destination");
    if (o === d) return toast.warning("Origin and destination must be different");
    const priceList = Object.entries(prices)
      .map(([vid, val]) => ({ vehicle_id: parseInt(vid, 10), price: parseFloat(val) }))
      .filter((p) => !Number.isNaN(p.price) && p.price > 0);
    if (!priceList.length) return toast.warning("Set a price for at least one vehicle");
    mutation.mutate({ origin_id: o, destination_id: d, is_active: isActive ? 1 : 0, prices: priceList });
  };

  return (
    <div className={modalWrap}>
      <form onSubmit={submit} className={`${modalCard} max-w-lg max-h-[92vh]`}>
        <ModalHeader title={isEdit ? "Edit Route" : "Add New Route"} onClose={onClose} />
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Origin" required>
              <select className={inputClass} value={originId} onChange={(e) => setOriginId(e.target.value)}>
                <option value="">Select location...</option>
                {activeLocations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <Field label="Destination" required>
              <select className={inputClass} value={destId} onChange={(e) => setDestId(e.target.value)}>
                <option value="">Select location...</option>
                {activeLocations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-navy mb-1.5">Vehicles & Prices</label>
            {activeVehicles.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400 border border-gray-200 rounded-xl">No active vehicles. Add vehicles first.</p>
            ) : (
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                {activeVehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-sm font-semibold text-navy">{v.name}</div>
                      <div className="font-body text-xs text-gray-400">Up to {v.max_passengers} pax · {v.max_luggage ?? 0} bags</div>
                    </div>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={prices[v.id] ?? ""} onChange={(e) => setPrices((p) => ({ ...p, [v.id]: e.target.value }))} className="w-32 text-right px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none" />
                    <span className="text-xs text-gray-400">THB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="font-body text-sm font-semibold text-gray-700">Active</span>
          </label>
        </div>
        <ModalFooter onClose={onClose} saving={mutation.isPending} />
      </form>
    </div>
  );
}

// ─── Resource tab helpers ─────────────────────────────────────────
function useResource(key, path) {
  return useQuery({ queryKey: ["transfers", key], queryFn: () => listItems(path) });
}

function LocationsTab() {
  const qc = useQueryClient();
  const { data: items = [], isPending } = useResource("locations", "transfers.php?resource=locations");
  const [modal, setModal] = useState(undefined);
  const del = useMutation({
    mutationFn: (id) => apiMutate(`transfers.php?resource=locations&id=${id}`, "DELETE"),
    onSuccess: () => { toast.success("Location deleted"); qc.invalidateQueries({ queryKey: ["transfers", "locations"] }); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });
  const onSaved = (m) => { setModal(undefined); toast.success(m); qc.invalidateQueries({ queryKey: ["transfers", "locations"] }); };
  return (
    <>
      <div className="flex justify-end mb-4"><button className={addBtn} onClick={() => setModal(null)}>+ Add New Location</button></div>
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? <p className="p-6 font-body text-gray-500">Loading...</p> : items.length === 0 ? <p className="p-10 text-center font-body text-gray-500">No locations yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="bg-navy text-white text-left"><th className={th}>Name</th><th className={th}>Sort</th><th className={th}>Status</th><th className={`${th} text-right`}>Actions</th></tr></thead>
            <tbody>{items.map((loc) => (
              <tr key={loc.id} className="border-t border-gray-100 hover:bg-yellow/5">
                <td className={`${td} font-semibold text-navy`}>{loc.name}</td>
                <td className={td}>{loc.sort_order ?? 0}</td>
                <td className={td}>{activeBadge(Number(loc.is_active) === 1)}</td>
                <td className={td}><div className="flex gap-2 justify-end"><button className={editBtn} onClick={() => setModal(loc)}>Edit</button><button className={delBtn} onClick={() => window.confirm("Delete this location? Routes that use it will also be removed.") && del.mutate(loc.id)}>Delete</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {modal !== undefined && <LocationModal item={modal} onClose={() => setModal(undefined)} onSaved={onSaved} />}
    </>
  );
}

function VehiclesTab() {
  const qc = useQueryClient();
  const { data: items = [], isPending } = useResource("vehicles", "transfers.php?resource=vehicles");
  const [modal, setModal] = useState(undefined);
  const del = useMutation({
    mutationFn: (id) => apiMutate(`transfers.php?resource=vehicles&id=${id}`, "DELETE"),
    onSuccess: () => { toast.success("Vehicle deleted"); qc.invalidateQueries({ queryKey: ["transfers", "vehicles"] }); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });
  const onSaved = (m) => { setModal(undefined); toast.success(m); qc.invalidateQueries({ queryKey: ["transfers", "vehicles"] }); };
  return (
    <>
      <div className="flex justify-end mb-4"><button className={addBtn} onClick={() => setModal(null)}>+ Add New Vehicle</button></div>
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? <p className="p-6 font-body text-gray-500">Loading...</p> : items.length === 0 ? <p className="p-10 text-center font-body text-gray-500">No vehicles yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="bg-navy text-white text-left"><th className={th}>Image</th><th className={th}>Name</th><th className={th}>Passengers</th><th className={th}>Luggage</th><th className={th}>Status</th><th className={`${th} text-right`}>Actions</th></tr></thead>
            <tbody>{items.map((v) => (
              <tr key={v.id} className="border-t border-gray-100 hover:bg-yellow/5">
                <td className={td}>{v.image_url ? <img src={v.image_url} alt={v.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200" /> : <span className="text-xs text-gray-400">No img</span>}</td>
                <td className={`${td} font-semibold text-navy`}>{v.name}</td>
                <td className={td}>Up to {v.max_passengers}</td>
                <td className={td}>{v.max_luggage ?? 0}</td>
                <td className={td}>{activeBadge(Number(v.is_active) === 1)}</td>
                <td className={td}><div className="flex gap-2 justify-end"><button className={editBtn} onClick={() => setModal(v)}>Edit</button><button className={delBtn} onClick={() => window.confirm("Delete this vehicle? Prices set on routes will also be removed.") && del.mutate(v.id)}>Delete</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {modal !== undefined && <VehicleModal item={modal} onClose={() => setModal(undefined)} onSaved={onSaved} />}
    </>
  );
}

function RoutesTab() {
  const qc = useQueryClient();
  const { data: routes = [], isPending } = useResource("routes", "transfers.php?resource=routes");
  const { data: locations = [] } = useResource("locations", "transfers.php?resource=locations");
  const { data: vehicles = [] } = useResource("vehicles", "transfers.php?resource=vehicles");
  const [modal, setModal] = useState(undefined);
  const del = useMutation({
    mutationFn: (id) => apiMutate(`transfers.php?resource=routes&id=${id}`, "DELETE"),
    onSuccess: () => { toast.success("Route deleted"); qc.invalidateQueries({ queryKey: ["transfers", "routes"] }); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });
  const onSaved = (m) => { setModal(undefined); toast.success(m); qc.invalidateQueries({ queryKey: ["transfers", "routes"] }); };
  return (
    <>
      <div className="flex justify-end mb-4"><button className={addBtn} onClick={() => setModal(null)}>+ Add New Route</button></div>
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {isPending ? <p className="p-6 font-body text-gray-500">Loading...</p> : routes.length === 0 ? <p className="p-10 text-center font-body text-gray-500">No routes yet. Add Locations and Vehicles first.</p> : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="bg-navy text-white text-left"><th className={th}>Route</th><th className={th}>Vehicles &amp; Prices</th><th className={th}>Status</th><th className={`${th} text-right`}>Actions</th></tr></thead>
            <tbody>{routes.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-yellow/5">
                <td className={td}><span className="font-semibold text-navy">{r.origin_name}</span><div className="text-xs text-gray-400">↔ {r.destination_name}</div></td>
                <td className={td}>{(r.prices || []).length ? (r.prices || []).map((p) => <div key={p.vehicle_id} className="text-xs"><strong>{p.vehicle_name}</strong> — {formatCurrency(p.price)}</div>) : <span className="text-xs text-gray-400">No prices set</span>}</td>
                <td className={td}>{activeBadge(Number(r.is_active) === 1)}</td>
                <td className={td}><div className="flex gap-2 justify-end"><button className={editBtn} onClick={() => setModal(r)}>Edit</button><button className={delBtn} onClick={() => window.confirm("Delete this route? All prices for this route will be removed.") && del.mutate(r.id)}>Delete</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {modal !== undefined && <RouteModal item={modal} locations={locations} vehicles={vehicles} onClose={() => setModal(undefined)} onSaved={onSaved} />}
    </>
  );
}

// ─── Page Gallery ─────────────────────────────────────────────────
const GALLERY_MAX = 12;
function GalleryTab() {
  const [images, setImages] = useState([]); // { src, alt }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("transfers.php?action=gallery");
        setImages(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onUpload = async (files) => {
    if (!files?.length) return;
    if (images.length + files.length > GALLERY_MAX) return toast.warning(`Maximum ${GALLERY_MAX} gallery images allowed.`);
    setUploading(true);
    for (const file of files) {
      try {
        const data = await uploadFile(file, "transfers");
        const url = data.data?.url || data.url;
        if (data.success && url) setImages((imgs) => [...imgs, { src: url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }]);
        else toast.error(data.message || "Upload failed");
      } catch {
        toast.error("Upload failed");
      }
    }
    setUploading(false);
  };

  const onDrop = (target) => {
    const from = dragIndex.current;
    if (from === null || from === target) return;
    setImages((imgs) => {
      const next = [...imgs];
      const [item] = next.splice(from, 1);
      next.splice(target, 0, item);
      return next;
    });
    dragIndex.current = null;
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = await apiJson("transfers.php?action=gallery", "POST", { images });
      if (data.success) toast.success("Gallery saved successfully!");
      else toast.error(data.message || "Failed to save gallery");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="font-body text-gray-500">Loading gallery...</p>;
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body text-base font-semibold text-navy">Transfer Page Gallery</h3>
        <span className="font-body text-xs text-gray-400">{images.length} / {GALLERY_MAX} images</span>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        {images.map((img, i) => (
          <div key={i} draggable onDragStart={() => (dragIndex.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)} className="relative w-32 rounded-lg overflow-hidden border border-gray-200 cursor-grab">
            <img src={img.src} alt={img.alt || ""} className="w-full h-24 object-cover pointer-events-none" />
            <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-sm">&times;</button>
            <input value={img.alt || ""} onChange={(e) => setImages((imgs) => imgs.map((x, idx) => (idx === i ? { ...x, alt: e.target.value } : x)))} placeholder="Caption" className="w-full px-2 py-1 font-body text-xs border-t border-gray-100 focus:outline-none" />
          </div>
        ))}
      </div>
      <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all flex flex-col items-center justify-center mb-4">
        <span className="font-body text-sm font-medium text-gray-500">{uploading ? "Uploading..." : "Click to upload images"}</span>
        <small className="text-xs text-gray-400 mt-1">Drag thumbnails to reorder · max {GALLERY_MAX}</small>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
      </label>
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className={addBtn}>{saving ? "Saving..." : "Save Gallery"}</button>
      </div>
    </div>
  );
}

export default function Transfers() {
  const [tab, setTab] = useState("routes");
  const content = useMemo(() => {
    switch (tab) {
      case "locations": return <LocationsTab />;
      case "vehicles": return <VehiclesTab />;
      case "gallery": return <GalleryTab />;
      default: return <RoutesTab />;
    }
  }, [tab]);

  return (
    <div className="max-w-7xl">
      <h1 className="font-heading text-4xl text-navy mb-6">Transfers</h1>
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 font-body text-sm font-semibold border-b-2 -mb-px transition-all ${tab === t.key ? "text-navy border-navy" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {content}
    </div>
  );
}
