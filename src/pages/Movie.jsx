import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

// Helper function to safely extract price from showtime object
const getPrice = (showtime) => {
  if (!showtime) return 0;
  const priceValue = showtime.price || showtime.Price || showtime.ticket_price || showtime.ticketPrice || 0;
  const numPrice = parseFloat(priceValue);
  return isNaN(numPrice) ? 0 : numPrice;
};

export default function Movie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showId, setShowId] = useState("");
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.movieDetails(id)
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedShow = useMemo(
    () => data?.showtimes.find(s => String(s.id) === String(showId)),
    [data, showId]
  );

  async function book() {
    setMsg("");
    setMsgType("");
    if (!showId || !qty) {
      setMsg("Please select a showtime and number of tickets");
      setMsgType("error");
      return;
    }

    // Navigate to checkout page with booking data
    navigate("/checkout", {
      state: {
        showtimeId: showId,
        seats: Number(qty),
        userEmail: email || "guest@example.com",
        userName: name || "Guest",
        movieTitle: data.movie.title,
        showtime: selectedShow.start_time,
        theaterName: selectedShow.theater_name,
        price: getPrice(selectedShow),
      },
    });
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: "16px" }}>Loading movie details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: "16px",
            padding: "8px 16px",
            background: "#e50914",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Movies
        </button>
        <div className="message error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: "16px",
            padding: "8px 16px",
            background: "#e50914",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Movies
        </button>
        <div className="empty-state">
          <p className="empty-state-text">Movie not found</p>
        </div>
      </div>
    );
  }

  const posterUrl = data.movie.poster_url || null;

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "24px",
          padding: "8px 16px",
          background: "transparent",
          color: "#e50914",
          border: "2px solid #e50914",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          transition: "all 0.3s ease",
        }}
      >
        ← Back to Movies
      </button>

      <div className="movie-detail-container">
        <div className="movie-detail-header">
          <div className="movie-detail-poster">
            {posterUrl ? (
              <img src={posterUrl} alt={data.movie.title} />
            ) : (
              <div style={{ textAlign: "center", color: "#999" }}>
                <div style={{ fontSize: "64px", marginBottom: "8px" }}>🎬</div>
                <div>No poster available</div>
              </div>
            )}
          </div>

          <div className="movie-detail-info">
            <h2>{data.movie.title}</h2>

            <div className="movie-detail-meta">
              {data.movie.duration_minutes && (
                <div className="meta-item">
                  <div className="meta-label">Duration</div>
                  <div className="meta-value">{data.movie.duration_minutes} minutes</div>
                </div>
              )}
              {data.movie.genre && (
                <div className="meta-item">
                  <div className="meta-label">Genre</div>
                  <div className="meta-value">{data.movie.genre}</div>
                </div>
              )}
              {data.movie.release_date && (
                <div className="meta-item">
                  <div className="meta-label">Release Date</div>
                  <div className="meta-value">
                    {new Date(data.movie.release_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {data.movie.description && (
              <p className="movie-description">{data.movie.description}</p>
            )}

            {data.showtimes && data.showtimes.length > 0 && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
                  Available Showtimes
                </h3>
                <ul style={{ listStyle: "none", color: "#666", fontSize: "14px" }}>
                  {data.showtimes.slice(0, 3).map(s => (
                    <li key={s.id} style={{ marginBottom: "8px", paddingLeft: "24px" }}>
                      <span style={{ fontWeight: "600", color: "#221f1f" }}>
                        {new Date(s.start_time).toLocaleString()}
                      </span>
                      <span style={{ marginLeft: "16px" }}>{s.theater_name}</span>
                      <span style={{ marginLeft: "16px", color: "#e50914", fontWeight: "600" }}>
                        €{getPrice(s).toFixed(2)}
                      </span>
                    </li>
                  ))}
                  {data.showtimes.length > 3 && (
                    <li style={{ marginTop: "12px", color: "#999", fontSize: "13px" }}>
                      +{data.showtimes.length - 3} more showtimes available
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {data.showtimes && data.showtimes.length > 0 && (
          <div className="booking-section">
            <h3>Book Your Tickets</h3>

            <form className="booking-form">
              <div className="form-group">
                <label>Select Showtime *</label>
                <select value={showId} onChange={e => setShowId(e.target.value)}>
                  <option value="">Choose a showtime</option>
                  {data.showtimes.map(s => (
                    <option value={s.id} key={s.id}>
                      {new Date(s.start_time).toLocaleString()} — {s.theater_name} — €{getPrice(s).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Number of Tickets *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                  />
                  {selectedShow && (
                    <div className="price-info">
                      Total: <span className="price">€{(getPrice(selectedShow) * Number(qty)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name (optional)"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                />
              </div>

              <button
                type="button"
                onClick={book}
                disabled={!showId || !qty}
                className="booking-button"
              >
                {selectedShow
                  ? `Book for €${(getPrice(selectedShow) * Number(qty)).toFixed(2)}`
                  : "Select Showtime to Book"}
              </button>

              {msg && (
                <div className={`message ${msgType}`}>
                  {msg}
                </div>
              )}
            </form>
          </div>
        )}

        {(!data.showtimes || data.showtimes.length === 0) && (
          <div className="booking-section">
            <p style={{ color: "#999", textAlign: "center" }}>
              ℹ️ No showtimes available for this movie
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
