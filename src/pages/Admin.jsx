import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin() {
    const [movies, setMovies] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        loadMovies();
    }, []);

    function loadMovies() {
        api.listMovies().then(setMovies).catch(e => setMsg("Error loading movies: " + e.message));
    }

    async function handleAdd(e) {
        e.preventDefault();
        setMsg("");
        if (!title) return;

        try {
            await api.createMovie({ title, description });
            setTitle("");
            setDescription("");
            setMsg("Movie added successfully");
            loadMovies();
        } catch (err) {
            setMsg("Error adding movie: " + err.message);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this movie?")) return;
        try {
            await api.deleteMovie(id);
            setMsg("Movie deleted");
            loadMovies();
        } catch (err) {
            setMsg("Error deleting movie: " + err.message);
        }
    }

    return (
        <div>
            <h2>Admin Dashboard</h2>

            <div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
                <h3>Add New Movie</h3>
                <form onSubmit={handleAdd}>
                    <div style={{ marginBottom: 8 }}>
                        <label style={{ display: "block", marginBottom: 4 }}>Title:</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <label style={{ display: "block", marginBottom: 4 }}>Description:</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{ width: "100%", padding: 8, minHeight: 60 }}
                        />
                    </div>
                    <button type="submit" style={{ padding: "8px 16px" }}>Add Movie</button>
                </form>
            </div>

            {msg && <div style={{ marginBottom: 16, padding: 8, background: "#f0f0f0" }}>{msg}</div>}

            <h3>Existing Movies</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {movies.map(m => (
                    <li key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                        <span>{m.title}</span>
                        <button
                            onClick={() => handleDelete(m.id)}
                            style={{ background: "#ff4444", color: "white", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
