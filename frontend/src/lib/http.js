/**
 * Helpers that normalise the backend's response envelope.
 *
 * The API mostly returns `{ success, message, data }`, but a few controllers
 * (dashboard, vaksinasi, kandang, user) pass the arguments to their response
 * helper in the wrong order, so the real payload lands in `message` instead of
 * `data`. `pickPayload` returns whichever field actually holds the object/array.
 */
export function pickPayload(response) {
  const body = response?.data;

  if (body == null || typeof body !== "object") return body;

  const isMeaningful = (value) =>
    value != null && (typeof value === "object" || Array.isArray(value));

  if (isMeaningful(body.data)) return body.data;
  if (isMeaningful(body.message)) return body.message;
  if ("data" in body) return body.data;

  return body;
}

/**
 * A kandang list response is `{ data: [...], pagination: {...} }` (itself nested
 * inside the envelope). This unwraps to `{ rows, pagination }`.
 */
export function pickPaginated(response) {
  const payload = pickPayload(response) || {};
  return {
    rows: Array.isArray(payload) ? payload : payload.data || [],
    pagination: payload.pagination || null,
  };
}

/**
 * Extract a human-readable error message from an axios error.
 */
export function getErrorMessage(error, fallback = "Terjadi kesalahan. Coba lagi.") {
  if (!error) return fallback;

  const data = error.response?.data;
  if (data) {
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.error === "string" && data.error) return data.error;
    if (Array.isArray(data.errors) && data.errors[0]?.message)
      return data.errors[0].message;
  }

  if (error.code === "ECONNABORTED")
    return "Permintaan melebihi batas waktu. Periksa koneksi Anda.";
  if (error.message === "Network Error")
    return "Tidak dapat terhubung ke server.";

  return error.message || fallback;
}
