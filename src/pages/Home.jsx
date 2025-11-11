import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.listMovies().then(setMovies).catch(e => setErr(String(e)));
  }, []);

  if (err) return <div>Error: {err}</div>;
  return (
    <div>
      <h2>Movies</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
        {movies.map(m => (
          <Link key={m.id} to={`/movie/${m.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <img src={m.poster_url} alt={m.title} style={{ width: "100%", borderRadius: 6, marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>{m.title}</div>
              <div style={{ color: "#555" }}>{m.duration_minutes} min</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
