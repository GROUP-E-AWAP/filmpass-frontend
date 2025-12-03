import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api";

// Helper function to safely extract price from showtime object
const getPrice = (showtime) => {
  if (!showtime) return 0;
  const priceValue = showtime.price || showtime.Price || showtime.ticket_price || showtime.ticketPrice || 0;
  const numPrice = parseFloat(priceValue);
  return isNaN(numPrice) ? 0 : numPrice;
};
import SeatMap from "../components/SeatMap.jsx";
import { getStoredUser } from "../auth";

/**
 * Movie details + booking page.
 *
 * Responsibilities:
 *  - Load movie details + available showtimes (optionally filtered by theater)
 *  - Let user choose showtime, ticket type, seats
 *  - Handle booking as:
 *      - authenticated user (from JWT / local storage)
 *      - guest (name + email required)
 */
export default function Movie() {
  const { id } = useParams(); // movie id from URL
  const [searchParams] = useSearchParams();
  const theaterId = searchParams.get("theaterId"); // optional theater context
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);

  // Booking-related state
  const [showId, setShowId] = useState(""); // selected showtime id
  const [seats, setSeats] = useState([]);   // seats for current showtime
  const [selected, setSelected] = useState([]); // selected seat ids
  const [ticketType, setTicketType] = useState("adult");

  // Guest booking info (for non-auth users)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [msg, setMsg] = useState("");

  // Initial auth info (used to pre-fill name/email or hide guest fields)
  const [authUser] = useState(() => getStoredUser());

  // ===== Load movie + showtimes =====
  // Taking into account optional theaterId filter
  useEffect(() => {
    setLoading(true);
    setPageError("");
    setShowId("");
    setSeats([]);
    setSelected([]);

    api
      .movieDetails(id, theaterId ? { theaterId } : undefined)
      .then(d => {
        console.log("Movie details loaded:", d);
        console.log("Showtimes array:", d.showtimes);
        console.log("Showtimes count:", d.showtimes?.length || 0);
        
        // Ensure showtimes is always an array
        if (d && !d.showtimes) {
          d.showtimes = [];
        }
        
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error("movieDetails error:", e);
        setPageError(e.message);
        setLoading(false);
      });
  }, [id, theaterId]);

  // ===== Auto-fill name/email from authenticated user (if logged in) =====
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || authUser.email || "");
      setEmail(authUser.email || "");
    }
  }, [authUser]);

  // ===== Load seats for selected showtime =====
  useEffect(() => {
    if (!showId) {
      setSeats([]);
      setSelected([]);
      return;
    }

    api
      .seats(showId)
      .then(setSeats)
      .catch(e => {
        console.error("seats error:", e);
        setMsg("Failed to load seats: " + e.message);
      });
  }, [showId]);

  // Find currently selected showtime object for convenience
  const currentShow = useMemo(
    () =>
      data?.showtimes?.find(s => String(s.id) === String(showId)) || null,
    [data, showId]
  );

  // ===== Handle booking submission =====
  async function handleBook(e) {
    e.preventDefault();
    setMsg("");

    // Basic validation: must have showtime + at least one seat
    if (!showId || selected.length === 0) {
      setMsg("Select showtime and at least one seat.");
      return;
    }

    // Navigate to checkout page with booking data
    navigate("/checkout", {
      state: {
        showtimeId: showId,
        seats: selected.length,
        userEmail: email || "guest@example.com",
        userName: name || "Guest",
        movieTitle: data.movie.title,
        showtime: currentShow?.start_time,
        theaterName: currentShow?.theater_name,
        price: getPrice(currentShow),
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

  if (pageError) {
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
          <strong>Error:</strong> {pageError}
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
    <div className="movie-page">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="back-button"
      >
        ← Back to Theaters
      </button>

      {/* Hero Section with Poster & Info */}
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          {posterUrl && <img src={posterUrl} alt="" className="hero-backdrop-image" />}
        </div>

        <div className="movie-hero-content">
          <div className="movie-hero-poster">
            {posterUrl ? (
              <img src={posterUrl} alt={data.movie.title} />
            ) : (
              <div className="poster-placeholder">
                <div className="poster-icon">🎬</div>
                <div>No poster</div>
              </div>
            )}
          </div>

          <div className="movie-hero-info">
            <h1 className="movie-title">{data.movie.title}</h1>

            <div className="movie-meta">
              {data.movie.duration_minutes && (
                <span className="meta-badge">
                  <span className="meta-icon">⏱</span>
                  {data.movie.duration_minutes} min
                </span>
              )}
              {data.movie.genre && (
                <span className="meta-badge">
                  <span className="meta-icon">🎭</span>
                  {data.movie.genre}
                </span>
              )}
              {data.movie.release_date && (
                <span className="meta-badge">
                  <span className="meta-icon">📅</span>
                  {new Date(data.movie.release_date).getFullYear()}
                </span>
              )}
            </div>

            {data.movie.description && (
              <p className="movie-description">{data.movie.description}</p>
            )}

            {data?.showtimes && Array.isArray(data.showtimes) && data.showtimes.length > 0 && (
              <div className="showtimes-preview">
                <h3>Available Showtimes</h3>
                <div className="showtimes-list">
                  {data.showtimes.slice(0, 3).map(s => (
                    <div key={s.id} className="showtime-item">
                      <div className="showtime-time">
                        {new Date(s.start_time).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                      <div className="showtime-details">
                        <span className="showtime-theater">{s.theater_name}</span>
                        <span className="showtime-price">€{getPrice(s).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  {data.showtimes.length > 3 && (
                    <div className="showtimes-more">
                      +{data.showtimes.length - 3} more showtimes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="booking-section">
        <h2 className="booking-title">Book Your Tickets</h2>

        <form onSubmit={handleBook} className="booking-form">
          <div className="form-row">
            {/* Showtime selector */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎬</span>
                Choose Showtime
              </label>
              <select
                value={showId}
                onChange={e => setShowId(e.target.value)}
                className="form-select"
              >
                <option value="">Select a showtime</option>
                {data?.showtimes && Array.isArray(data.showtimes) ? (
                  data.showtimes.map(st => {
                    const dt = st.start_time
                      ? new Date(st.start_time)
                      : st.show_date
                      ? new Date(st.show_date)
                      : null;

                    const parts = [];
                    if (dt) {
                      parts.push(
                        dt.toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      );
                    }
                    if (st.theater_name) parts.push(st.theater_name);
                    if (st.auditorium_name) parts.push(st.auditorium_name);
                    if (st.price != null)
                      parts.push(`€${Number(st.price).toFixed(2)}`);

                    return (
                      <option key={st.id} value={st.id}>
                        {parts.join(" • ")}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No showtimes available</option>
                )}
              </select>
            </div>

            {/* Ticket type selector */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎫</span>
                Ticket Type
              </label>
              <select
                value={ticketType}
                onChange={e => setTicketType(e.target.value)}
                className="form-select"
              >
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </select>
            </div>
          </div>

          {/* No showtimes message */}
          {(!data?.showtimes || data.showtimes.length === 0) && (
            <div className="no-showtimes-message">
              <span className="warning-icon">⚠️</span>
              <p>No showtimes available for this movie at the moment.</p>
              <p className="suggestion">Please check back later or contact the theater.</p>
            </div>
          )}

          {/* User Details */}
          {authUser ? (
            <div className="user-info-box">
              <span className="user-icon">👤</span>
              <span>Booking as <strong>{authUser.email}</strong></span>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Your Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          {/* Seat Selection */}
          {showId && seats.length > 0 && (
            <div className="seat-selection-section">
              <h3 className="seat-selection-title">
                <span className="label-icon">💺</span>
                Select Your Seats
              </h3>
              <SeatMap
                seats={seats}
                selected={selected}
                toggle={seatId => {
                  setSelected(prev =>
                    prev.includes(seatId)
                      ? prev.filter(x => x !== seatId)
                      : [...prev, seatId]
                  );
                }}
              />
              {selected.length > 0 && (
                <div className="selected-seats-info">
                  Selected: <strong>{selected.length} seat{selected.length > 1 ? "s" : ""}</strong>
                  {currentShow && (
                    <span className="total-price">
                      Total: <strong>€{(getPrice(currentShow) * selected.length).toFixed(2)}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!showId || selected.length === 0}
            className="booking-submit-btn"
          >
            {selected.length > 0
              ? `Proceed to Checkout (${selected.length} seat${selected.length > 1 ? "s" : ""})`
              : "Select Seats to Continue"}
          </button>

          {/* Feedback message */}
          {msg && <div className="booking-message">{msg}</div>}
        </form>
      </div>
    </div>
  );
}
