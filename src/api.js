const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function fetchJSON(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `${res.status} ${res.statusText}`);
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
    })
};
