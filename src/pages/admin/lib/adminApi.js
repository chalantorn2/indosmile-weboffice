// Shared helpers for the React admin. Every module talks to the same PHP REST API
// the legacy admin uses, so behaviour and payloads stay identical during migration.

export const API_BASE = "/backend/api";

/**
 * fetch wrapper that always sends the session cookie and parses JSON.
 * Returns the parsed body ({ success, data, message }) or throws on network error.
 */
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}/${path}`, {
    credentials: "include",
    ...options,
  });
  return response.json();
}

export function apiJson(path, method, body) {
  return apiFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * React Query expects fetchers to resolve with data or throw on failure, so these
 * two unwrap the { success, data, message } envelope: they return `data` on success
 * and throw the API message otherwise. Use them from useQuery/useMutation.
 */
export async function apiGet(path) {
  const res = await apiFetch(path);
  if (!res.success) throw new Error(res.message || "Request failed");
  return res.data;
}

export async function apiMutate(path, method, body) {
  const res = body === undefined ? await apiFetch(path, { method }) : await apiJson(path, method, body);
  if (!res.success) throw new Error(res.message || "Request failed");
  return res.data;
}

/** Upload a single image. Mirrors uploadFile() in the legacy admin. */
export async function uploadFile(file, folder = "tours") {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${API_BASE}/upload.php?folder=${folder}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return response.json();
}

/** Upload multiple images. Mirrors uploadFiles() in the legacy admin. */
export async function uploadFiles(files) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("images[]", files[i]);
  }
  const response = await fetch(`${API_BASE}/upload.php`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return response.json();
}

export function formatCurrency(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(n);
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("th-TH");
}

/**
 * Payment can only be collected once availability is confirmed — same rule the
 * customer's status page enforces, so the two never disagree.
 */
export function isAwaitingPayment(booking) {
  return booking.status === "confirmed" && booking.payment_status === "unpaid";
}

export function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
