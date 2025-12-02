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
    setMovies([]);
    setError("");

    // If theater is not selected, we can't show movies
    if (!theaterId) {
      setError("Theater is not selected.");
      return;
    }

    api
      .listMoviesByTheater(theaterId)
      .then(data => {
        setMovies(data);
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
