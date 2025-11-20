import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { SearchBar } from "../components/searchBar";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.listMovies().then(setMovies).catch(e => setErr(String(e)));
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (err) return <div>Error: {err}</div>;
  return (
    <div>
      <SearchBar onSearch={setSearchTerm} />
      <h2>Movies</h2>
      <ul style={{ lineHeight: 1.8 }}>
        {filteredMovies.map(m => (
          <li key={m.id}>
            <Link to={`/movie/${m.id}`}>{m.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
