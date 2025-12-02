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
      {/* Movie poster + basic info */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 20,
            flexWrap: "wrap"
          }}
        >
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
      </div>
    </div>

      {/* Booking form: showtime, ticket type, user details, seats */}
      <form
        onSubmit={handleBook}
        style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 420 }}
      >
        {/* Showtime selector */}
        <label>
          Showtime:
          <select
            value={showId}
            onChange={e => setShowId(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="">Select showtime</option>
            {data.showtimes.map(st => {
              // Convert date/time fields to readable string
              const dt = st.start_time
                ? new Date(st.start_time)
                : st.show_date
                ? new Date(st.show_date)
                : null;

              const parts = [];
              if (dt) parts.push(dt.toLocaleString());
              if (st.theater_name) parts.push(st.theater_name);
              if (st.auditorium_name) parts.push(st.auditorium_name);
              if (st.price != null)
                parts.push(`€${Number(st.price).toFixed(2)}`);

              return (
                <option key={st.id} value={st.id}>
                  {parts.join(" — ")}
                </option>
              );
            })}
          </select>
        </label>

        {/* Ticket type selector (affects price calculation on backend) */}
        <label>
          Ticket type:
          <select
            value={ticketType}
            onChange={e => setTicketType(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </select>
        </label>

        {/* Authenticated user sees info instead of email form */}
        {authUser ? (
          <p style={{ fontSize: 14, color: "#555" }}>
            Booking as <b>{authUser.email}</b>
          </p>
        ) : (
          // Guest user must enter name/email
          <>
            <label>
              Name:
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label>
              Email:
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </>
        )}

        {/* Seat map rendered only after showtime is selected and seats loaded */}
        {showId && seats.length > 0 && (
          <div>
            <h3 style={{ marginTop: 10, marginBottom: 6 }}>Select seats</h3>
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
          </div>
        )}

        {/* Submit button, disabled until seats + showtime selected */}
        <button
          type="submit"
          disabled={!showId || selected.length === 0}
          style={{ marginTop: 8 }}
        >
          {selected.length
            ? `Book ${selected.length} seat${
                selected.length > 1 ? "s" : ""
              }`
            : "Book"}
        </button>
      </form>

      {/* Feedback message: errors or success */}
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
