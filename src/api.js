const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function fetchJSON(path, options) {
  const fullUrl = `${BASE}${path}`;
  console.log(`Making API request to: ${fullUrl}`, options?.method || 'GET');
  
  const res = await fetch(fullUrl, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const errorMessage = error.error || `${res.status} ${res.statusText}`;
    console.error(`API Error (${fullUrl}):`, errorMessage);
    throw new Error(errorMessage);
  }
  return res.json();
}

export const api = {
  // Health checks
  health: () => fetchJSON("/health"),
  dbHealth: () => fetchJSON("/db-health"),
  
  // Movies
  listMovies: () => fetchJSON("/movies"),
  movieDetails: id => fetchJSON(`/movies/${id}`),
  createMovie: payload =>
    fetchJSON(`/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  deleteMovie: id =>
    fetchJSON(`/movies/${id}`, {
      method: "DELETE"
    }),
  
  // Showtimes
  getShowtimes: id => fetchJSON(`/showtimes/${id}`),
  
  // Bookings
  createBooking: payload =>
    fetchJSON(`/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  
  // Payment
  createCheckoutSession: payload =>
    fetchJSON(`/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  
  verifyPayment: sessionId =>
    fetchJSON(`/verify-payment?session_id=${sessionId}`)
};
