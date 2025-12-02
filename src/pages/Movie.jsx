import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";
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

    const payload = {
      showtimeId: Number(showId),
      seats: selected,
      ticketType
    };

    // Guest user booking: require email, optionally pass name
    if (!authUser) {
      if (!email) {
        setMsg("Email is required for guest booking.");
        return;
      }
      payload.userEmail = email;
      if (name) payload.userName = name;
    }

    try {
      const res = await api.createBooking(payload);

      // Show confirmation with booking id and total
      setMsg(
        `Booking #${res.bookingId} confirmed. Total €${Number(
          res.total
        ).toFixed(2)}`
      );

      // Refresh seats to reflect newly booked seats
      const updatedSeats = await api.seats(showId);
      setSeats(updatedSeats);
      setSelected([]);
    } catch (err) {
      console.error("booking error:", err);
      setMsg("Error: " + err.message);
    }
  }

  // ===== Conditional states: loading / error / missing data =====
  if (loading) return <p>Loading...</p>;

  if (pageError)
    return <p style={{ color: "red" }}>Error loading movie: {pageError}</p>;

  if (!data || !data.movie) return <p>Movie not found.</p>;

  const { movie, showtimes = [] } = data;

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
        {movie.poster_url && (
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{
              width: 200,
              borderRadius: 10,
              objectFit: "cover"
            }}
          />
        )}

        <div>
          <h2>{movie.title}</h2>
          {movie.description && (
            <p style={{ maxWidth: "70%" }}>{movie.description}</p>
          )}
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
            {showtimes.map(st => {
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
