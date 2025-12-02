import React, { useEffect, useState } from "react";
import { api } from "../api";
import { SearchBar } from "../components/searchBar";
import { MovieCard } from "../components/MovieCard";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [moviePrices, setMoviePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    api.listMovies()
      .then(movies => {
        setMovies(movies);
        // Fetch showtimes for each movie to get pricing
        return Promise.all(
          movies.map(movie =>
            api.getShowtimes(movie.id)
              .then(showtimes => {
                console.log(`Showtimes for movie ${movie.id}:`, showtimes);
                // Handle both array and object responses
                let showArray = Array.isArray(showtimes) ? showtimes : (showtimes?.data || []);
                if (showArray && showArray.length > 0) {
                  const prices = showArray.map(s => {
                    // Try multiple possible price field names and ensure numeric conversion
                    const priceValue = s.price || s.Price || s.ticket_price || s.ticketPrice || 0;
                    const numPrice = parseFloat(priceValue);
                    console.log(`Showtime:`, s, `Price field:`, priceValue, `Converted:`, numPrice);
                    return numPrice;
                  }).filter(p => !isNaN(p) && p > 0);
                  if (prices.length > 0) {
                    const minPrice = Math.min(...prices);
                    console.log(`Min price for ${movie.id}:`, minPrice);
                    return { movieId: movie.id, minPrice };
                  }
                }
                return null;
              })
              .catch(err => {
                console.warn(`Failed to fetch showtimes for movie ${movie.id}:`, err);
                return null;
              })
          )
        ).then(results => {
          const prices = {};
          results.forEach(result => {
            if (result) {
              prices[result.movieId] = result.minPrice;
            }
          });
          setMoviePrices(prices);
        });
      })
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: "16px" }}>Loading movies...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="message error">
        <strong>Error:</strong> {err}
      </div>
    );
  }

  return (
    <div>
      <div className="search-wrapper">
        <SearchBar onSearch={setSearchTerm} />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>
          Movies & Showtimes
        </h2>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Showing {filteredMovies.length} of {movies.length} movies
        </p>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <p className="empty-state-text">
            {searchTerm
              ? `No movies found matching "${searchTerm}"`
              : "No movies available"}
          </p>
        </div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map(m => (
            <MovieCard key={m.id} movie={m} minPrice={moviePrices[m.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
