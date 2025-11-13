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
      <ul style={{ lineHeight: 1.8 }}>
        {movies.map(m => (
          <li key={m.id}>
            <Link to={`/movie/${m.id}`}>{m.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
