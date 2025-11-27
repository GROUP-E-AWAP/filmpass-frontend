const BASE = import.meta.env.VITE_API_BASE || "/api";

async function fetchJSON(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
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
  createBooking: payload =>
    fetchJSON(`/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
};
