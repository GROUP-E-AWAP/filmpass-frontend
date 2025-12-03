import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

/**
 * Home page for customers.
 * Shows a list of movies available in the currently selected theater.
 *
 * Theater context is taken from route params:
 *   /theaters/:theaterId/movies → theaterId
 */
export default function Home() {
  const { theaterId } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moviePrices, setMoviePrices] = useState({});
  const [error, setError] = useState("");

  // Load movies whenever theaterId changes
  useEffect(() => {
    setLoading(true);
    setError(""); // Clear previous errors
    
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
          setLoading(false);
        });
      })
      .catch(e => {
        console.error("Failed to load movies", e);
        setError("Failed to load movies");
        setLoading(false);
      });
  }, [theaterId]);

  return (
    <div className="movies-page">
      <h2 className="page-title">Now Showing</h2>

      {/* Display error if theater is missing or API failed */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading state */}
      {loading && <div className="loading-message">Loading movies...</div>}

      <div className="movie-grid">
        {movies.map(m => (
          <Link
            key={m.id}
            to={`/movie/${m.id}${theaterId ? `?theaterId=${encodeURIComponent(theaterId)}` : ''}`}
            className="movie-card-link"
          >
            <div className="movie-card">
              <div className="movie-poster">
                {m.poster_url ? (
                  <img src={m.poster_url} alt={m.title} />
                ) : (
                  <div className="poster-placeholder">
                    <span className="poster-placeholder-icon">🎬</span>
                  </div>
                )}
                {moviePrices[m.id] && (
                  <div className="movie-price-badge">
                    €{moviePrices[m.id].toFixed(2)}
                  </div>
                )}
              </div>

              <div className="movie-card-content">
                <h3 className="movie-card-title">{m.title}</h3>
                
                <div className="movie-card-meta">
                  {m.genre && (
                    <span className="meta-genre">{m.genre}</span>
                  )}
                  {m.duration_minutes && (
                    <span className="meta-duration">⏱ {m.duration_minutes}m</span>
                  )}
                </div>

                <p className="movie-card-description">
                  {m.description
                    ? m.description.slice(0, 100) + (m.description.length > 100 ? "..." : "")
                    : "No description available"}
                </p>

                <button className="movie-card-btn">
                  Book Tickets
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No movies for this theater, but also no error */}
      {!loading && movies.length === 0 && !error && (
        <div className="empty-state">No movies found for this theater.</div>
      )}
    </div>
  );
}
