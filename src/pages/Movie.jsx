import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function Movie() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [showId, setShowId] = useState("");
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.movieDetails(id).then(setData);
  }, [id]);

  const selectedShow = useMemo(
    () => data?.showtimes.find(s => String(s.id) === String(showId)),
    [data, showId]
  );

  async function book() {
    setMsg("");
    if (!showId || !qty) { setMsg("Select showtime and quantity"); return; }
    try {
      const res = await api.createBooking({
        userEmail: email || "guest@example.com",
        userName: name || "Guest",
        showtimeId: Number(showId),
        seats: Number(qty)
      });
      setMsg(`Booking #${res.bookingId} confirmed. Total €${Number(res.total).toFixed(2)}`);
      setQty(1);
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  }

  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <h2>{data.movie.title}</h2>
      {data.movie.description && <p style={{ color: "#444" }}>{data.movie.description}</p>}

      <div style={{ marginTop: 12 }}>
        <label>Showtime: </label>
        <select value={showId} onChange={e => setShowId(e.target.value)}>
          <option value="">Select showtime</option>
          {data.showtimes.map(s => (
            <option value={s.id} key={s.id}>
              {new Date(s.show_date + " " + s.start_time).toLocaleString()} — {s.theater_name} ({s.theater_location}) — €{Number(s.price).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>Tickets: </label>
        <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} style={{ width: 80 }} />
        {selectedShow && <span style={{ marginLeft: 10 }}>Price: €{(Number(selectedShow.price) * Number(qty)).toFixed(2)}</span>}
      </div>

      <div style={{ marginTop: 8 }}>
        <label>Name: </label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Email: </label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={book} disabled={!showId || !qty}>Book</button>
      </div>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
