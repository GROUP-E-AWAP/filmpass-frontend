import { getToken } from "./auth";

const BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Generic JSON fetch helper.
 *
 * Features:
 *  - Automatically attaches JWT token (if exists)
 *  - Always sends JSON headers
 *  - Reads response body only once (handles JSON or plain text)
 *  - Throws a JS Error with a readable message when response is not OK
 */
async function fetchJSON(path, options = {}) {
  const fullUrl = `${BASE}${path}`;
  console.log(`📡 Making API request to: ${fullUrl}`, options?.method || 'GET');
  
  const token = getToken();

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  // Read body once (may be JSON or plain text)
  let text = "";
  try {
    text = await res.text();
    console.log(`📥 Response status: ${res.status}, body: ${text.substring(0, 200)}`);
  } catch (e) {
    console.error(`❌ Error reading response body:`, e);
    text = "";
  }

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text); // If valid JSON → parse
      console.log(`✅ Parsed JSON response:`, data);
    } catch (e) {
      // Non-JSON text response → leave as-is
      console.warn(`⚠️  Response is not JSON, returning as text`);
      data = text;
    }
  }

  // If request failed, throw detailed error
  if (!res.ok) {
    let errorMessage = `${res.status} ${res.statusText}`;
    if (typeof data === 'object' && data?.error) {
      errorMessage = data.error;
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    console.error(`❌ API Error (${fullUrl}):`, errorMessage);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Centralized API client for frontend.
 * Each method corresponds to a backend route.
 */
export const api = {
  // ===== public =====

  listMovies: () => fetchJSON("/movies"),

  movieDetails: (id, opts) => {
    const theaterId = opts && opts.theaterId ? opts.theaterId : null;
    const query = theaterId ? `?theaterId=${encodeURIComponent(theaterId)}` : "";
    return fetchJSON(`/movies/${id}${query}`);
  },

  seats: showId => fetchJSON(`/showtimes/${showId}/seats`),

  getShowtimes: movieId => fetchJSON(`/movies/${movieId}/showtimes`),

  createBooking: payload =>
    fetchJSON(`/bookings`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  listTheaters: () => fetchJSON("/theaters"),

  listMoviesByTheater: theaterId =>
    fetchJSON(`/theaters/${theaterId}/movies`),

  // ===== admin =====

  adminListTheaters: () => fetchJSON("/admin/theaters"),

  adminCreateTheater: payload =>
    fetchJSON("/admin/theaters", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  adminListAuditoriums: theaterId =>
    fetchJSON(`/admin/theaters/${theaterId}/auditoriums`),

  adminCreateAuditorium: payload =>
    fetchJSON("/admin/auditoriums", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  adminListMovies: () => fetchJSON("/admin/movies"),

  adminCreateMovie: payload =>
    fetchJSON("/admin/movies", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  adminCreateShowtime: payload =>
    fetchJSON("/admin/showtimes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  adminListEmployees: () => fetchJSON("/admin/employees"),

  adminCreateEmployee: payload =>
    fetchJSON("/admin/employees", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    adminListBookings: params => {
    // Build clean ?query= only for non-empty params
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v != null && v !== "")
    ).toString();

    const path = query ? `/admin/bookings?${query}` : "/admin/bookings";
    return fetchJSON(path);
  },
  // В секцию admin добавь эти методы
adminDeleteTheater: (theaterId) =>
  fetchJSON(`/admin/theaters/${theaterId}`, { method: "DELETE" }),

adminDeleteAuditorium: (auditoriumId) =>
  fetchJSON(`/admin/auditoriums/${auditoriumId}`, { method: "DELETE" }),

adminDeleteMovie: (movieId) =>
  fetchJSON(`/admin/movies/${movieId}`, { method: "DELETE" }),

adminDeleteShowtime: (showtimeId) =>
  fetchJSON(`/admin/showtimes/${showtimeId}`, { method: "DELETE" }),

adminDeleteEmployee: (employeeId) =>
  fetchJSON(`/admin/employees/${employeeId}`, { method: "DELETE" }),

// Новый метод для списка всех сеансов
adminListShowtimes: () => fetchJSON("/admin/showtimes"),

  // ===== user =====
  
  // Payment
  createCheckoutSession: payload =>
    fetchJSON(`/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  
  verifyPayment: sessionId =>
    fetchJSON(`/verify-payment?session_id=${encodeURIComponent(sessionId)}`)
};
