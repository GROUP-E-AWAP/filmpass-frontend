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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all theaters on initial render
  useEffect(() => {
    setLoading(true);
    api
      .listTheaters()
      .then(data => {
        setTheaters(data);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to load theaters", e);
        setError("Failed to load theaters");
        setLoading(false);
      });
  }, []);

  return (
    <div className="theaters-page">
      <h2 className="page-title">Choose Your Theater</h2>

      {/* API load error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading state */}
      {loading && <div className="loading-message">Loading theaters...</div>}

      {/* Theater grid */}
      <div className="theater-grid">
        {theaters.map(t => (
          <Link to={`/theater/${t.id}`} key={t.id} className="theater-card-link">
            <div className="theater-card">
              <div className="theater-icon">🎭</div>
              <h3 className="theater-name">{t.name}</h3>
              <p className="theater-location">{t.location}</p>
              <button type="button" className="theater-btn">
                View Movies
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* No theaters in DB */}
      {!loading && theaters.length === 0 && !error && (
        <div className="empty-state">No theaters available at the moment.</div>
      )}
    </div>
  );
}
