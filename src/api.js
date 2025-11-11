export async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  listMovies: () => fetchJSON("/api/movies"),
  movieDetails: id => fetchJSON(`/api/movies/${id}`),
  seats: showId => fetchJSON(`/api/showtimes/${showId}/seats`),
  book: payload =>
    fetchJSON("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
};
