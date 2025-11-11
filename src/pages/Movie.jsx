import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import SeatMap from "../components/SeatMap.jsx";

export default function Movie() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showId, setShowId] = useState("");
  const [ticketType, setTicketType] = useState("adult");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.movieDetails(id).then(setData);
  }, [id]);

  useEffect(() => {
    if (showId) api.seats(showId).then(setSeats);
  }, [showId]);

  function toggleSeat(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function book() {
    setMsg("");
    try {
      const res = await api.book({
        showtimeId: showId,
        customerEmail: email || "customer@example.com",
        seats: selected,
        ticketType
      });
      setMsg(`Booking confirmed: ${res.bookingId}, total €${res.total.toFixed(2)}`);
      setSelected([]);
      if (showId) {
        const s = await api.seats(showId);
        setSeats(s);
      }
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  }

  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <img src={data.movie.poster_url} alt={data.movie.title} width="220" style={{ borderRadius: 8 }} />
        <div>
          <h2>{data.movie.title}</h2>
          <p style={{ color: "#444" }}>{data.movie.description}</p>
          <div>Duration: {data.movie.duration_minutes} min</div>
          <div style={{ marginTop: 12 }}>
            <label>Showtime: </label>
            <select value={showId} onChange={e => setShowId(e.target.value)}>
              <option value="">Select showtime</option>
              {data.showtimes.map(s => (
                <option value={s.id} key={s.id}>
                  {new Date(s.start_time).toLocaleString()} (Adult €{s.price_adult.toFixed(2)} / Child €{s.price_child.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Ticket type: </label>
            <select value={ticketType} onChange={e => setTicketType(e.target.value)}>
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Email: </label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>
      </div>

      {showId ? (
        <>
          <h3>Seat selection</h3>
          <SeatMap seats={seats} selected={selected} toggle={toggleSeat} />
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={book} disabled={selected.length === 0}>Book {selected.length} seat(s)</button>
            {msg && <div>{msg}</div>}
          </div>
        </>
      ) : (
        <div>Select showtime to load seats</div>
      )}
    </div>
  );
}
