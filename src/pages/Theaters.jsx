import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

/**
 * Theater selection page.
 * Loads all theaters from backend and displays them as cards.
 *
 * User flow:
 *  1) User opens page
 *  2) Component fetches list of theaters from API
 *  3) User selects a theater → redirected to its movie list
 */
export default function Theaters() {
  const [theaters, setTheaters] = useState([]);
  const [error, setError] = useState("");

  // Load all theaters on initial render
  useEffect(() => {
    api
      .listTheaters()
      .then(data => {
        setTheaters(data);
      })
      .catch(e => {
        console.error("Failed to load theaters", e);
        setError("Failed to load theaters");
      });
  }, []);

  return (
    <div>
      <h2>Choose a Theater</h2>

      {/* API load error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* No theaters in DB */}
      {theaters.length === 0 && !error && <p>No theaters found.</p>}

      {/* Theater list rendered as cards (reuse movie-card grid style) */}
      <div className="movie-grid">
        {theaters.map(t => (
          <div className="movie-card" key={t.id}>
            <div className="movie-title">{t.name}</div>

            <div
              style={{
                fontSize: 14,
                opacity: 0.8,
                marginBottom: 10,
                minHeight: 30
              }}
            >
              {t.location}
            </div>

            {/* Link to the movie list for this theater */}
            <Link to={`/theater/${t.id}`}>
              <button type="button">View movies</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
