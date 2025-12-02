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
  const [error, setError] = useState("");

  // Load movies whenever theaterId changes
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
      .catch(e => {
        console.error("Failed to load movies", e);
        setError("Failed to load movies");
      });
  }, [theaterId]);

  return (
    <div>
      <h2>Movies</h2>

      {/* Display error if theater is missing or API failed */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="movie-grid">
        {movies.map(m => (
          <div className="movie-card" key={m.id}>
            {/* Movie poster (if provided) */}
            {m.poster_url && (
              <img
                src={m.poster_url}
                alt={m.title}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 10,
                  objectFit: "cover",
                  maxHeight: 260
                }}
              />
            )}

            {/* Movie title */}
            <div className="movie-title">{m.title}</div>

            {/* Short description snippet */}
            <div
              style={{
                fontSize: 14,
                opacity: 0.7,
                marginBottom: 10,
                minHeight: 40
              }}
            >
              {m.description
                ? m.description.slice(0, 80) +
                  (m.description.length > 80 ? "…" : "")
                : "No description yet"}
            </div>

            {/* Link to movie details page, preserving theaterId in query */}
            <Link
              to={`/movie/${m.id}?theaterId=${encodeURIComponent(theaterId)}`}
            >
              <button type="button">View details</button>
            </Link>
          </div>
        ))}

        {/* No movies for this theater, but also no error */}
        {movies.length === 0 && !error && (
          <p style={{ marginTop: 10 }}>No movies found for this theater.</p>
        )}
      </div>
    </div>
  );
}
