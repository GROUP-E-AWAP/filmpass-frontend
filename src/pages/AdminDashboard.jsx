import React, { useEffect, useState } from "react";
import { api } from "../api";

/**
 * Reusable tab button for AdminDashboard.
 * Visually highlights the active tab.
 */
function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 6,
        border: active ? "1px solid #4a4adb" : "1px solid #ddd",
        background: active ? "#4a4adb" : "#fff",
        color: active ? "#fff" : "#111",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

function DeleteButton({ onClick, label = "Delete" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 12px",
        background: "#e50914",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px"
      }}
      onMouseEnter={(e) => e.target.style.background = "#c10812"}
      onMouseLeave={(e) => e.target.style.background = "#e50914"}
    >
      🗑️ {label}
    </button>
  );
}

// ===== Theaters tab =====

/**
 * Admin tab for managing theaters:
 *  - list existing theaters
 *  - create new theater (name + location)
 */
function AdminTheatersTab() {
  const [theaters, setTheaters] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Fetch list of theaters on initial render
  async function load() {
    try {
      setError("");
      const data = await api.adminListTheaters();
      setTheaters(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Handle creation of a new theater
  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await api.adminCreateTheater({ name, location });
      setName("");
      setLocation("");
      setMsg("Theater created");
      await load(); // refresh list
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(theaterId, theaterName) {
    if (!window.confirm(`Delete theater "${theaterName}" and ALL related data (auditoriums, showtimes, seats, bookings)? This cannot be undone!`)) return;
    setError("");
    setMsg("");
    try {
      await api.adminDeleteTheater(theaterId);
      setMsg(`Theater "${theaterName}" deleted`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#221f1f" }}>
        Theaters
      </h3>

      {error && (
        <div style={{
          background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
          borderLeft: "4px solid #e50914",
          color: "#c62828",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {error}
        </div>
      )}

      {msg && (
        <div style={{
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
          borderLeft: "4px solid #4caf50",
          color: "#2e7d32",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {msg}
        </div>
      )}

      {/* Form: create new theater */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "32px"
      }}>
        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
          Add New Theater
        </h4>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Theater Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required style={{
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "15px",
              transition: "all 0.3s ease"
            }} onFocus={e => e.target.style.borderColor = "#e50914"} onBlur={e => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} required style={{
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "15px",
              transition: "all 0.3s ease"
            }} onFocus={e => e.target.style.borderColor = "#e50914"} onBlur={e => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <button type="submit" style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
            onMouseEnter={e => { e.target.style.background = "linear-gradient(135deg, #e50914 0%, #c10812 100%)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(229, 9, 20, 0.3)"; }}
            onMouseLeave={e => { e.target.style.background = "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
            Add Theater
          </button>
        </form>
      </div>

      {/* Existing theaters */}
      <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
        Existing Theaters
      </h4>
      {theaters.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#666", background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          No theaters yet. Add your first theater above.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {theaters.map(t => (
            <div key={t.id} style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}>
              <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "12px" }}>🎭</div>
              <h5 style={{ fontSize: "18px", fontWeight: "700", color: "#221f1f", textAlign: "center", marginBottom: "8px" }}>{t.name}</h5>
              <p style={{ fontSize: "14px", color: "#666", textAlign: "center" }}>📍 {t.location}</p>
              <DeleteButton onClick={() => handleDelete(t.id, t.name)} label="Delete Theater" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Auditoriums tab =====

/**
 * Admin tab for managing auditoriums inside a theater:
 *  - select theater
 *  - create auditorium (name + rows/cols)
 *  - list auditoriums for selected theater
 */
function AdminAuditoriumsTab() {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [auditoriums, setAuditoriums] = useState([]);

  const [name, setName] = useState("");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Load all theaters once
  useEffect(() => {
    api
      .adminListTheaters()
      .then(setTheaters)
      .catch(e => setError(e.message));
  }, []);

  // When theater changes, load its auditoriums
  useEffect(() => {
    if (!selectedTheaterId) {
      setAuditoriums([]);
      return;
    }
    api
      .adminListAuditoriums(selectedTheaterId)
      .then(setAuditoriums)
      .catch(e => setError(e.message));
  }, [selectedTheaterId]);

  // Handle creation of a new auditorium
  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedTheaterId) {
      setError("Select theater first");
      return;
    }
    setError("");
    setMsg("");
    try {
      await api.adminCreateAuditorium({
        theaterId: Number(selectedTheaterId),
        name,
        seatRows: Number(rows),
        seatCols: Number(cols)
      });
      setName("");
      setRows(10);
      setCols(10);
      setMsg("Auditorium created and seats generated");

      const data = await api.adminListAuditoriums(selectedTheaterId);
      setAuditoriums(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(auditoriumId, auditoriumName) {
    if (!window.confirm(`Delete auditorium "${auditoriumName}" and ALL its seats and showtimes?`)) return;
    setError("");
    setMsg("");
    try {
      await api.adminDeleteAuditorium(auditoriumId);
      setMsg(`Auditorium "${auditoriumName}" deleted`);
      const data = await api.adminListAuditoriums(selectedTheaterId);
      setAuditoriums(data);
    } catch (e) {
      setError(e.message);
    }
  }

  const inputStyle = {
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.3s ease"
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#221f1f" }}>
        Auditoriums
      </h3>

      {error && (
        <div style={{
          background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
          borderLeft: "4px solid #e50914",
          color: "#c62828",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {error}
        </div>
      )}

      {msg && (
        <div style={{
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
          borderLeft: "4px solid #4caf50",
          color: "#2e7d32",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {msg}
        </div>
      )}

      {/* Theater selector */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "24px"
      }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>
            Select Theater
          </span>
          <select
            value={selectedTheaterId}
            onChange={e => setSelectedTheaterId(e.target.value)}
            style={{
              ...inputStyle,
              cursor: "pointer"
            }}
            onFocus={(e) => e.target.style.borderColor = "#e50914"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          >
            <option value="">Choose a theater...</option>
            {theaters.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Form: create new auditorium */}
      {selectedTheaterId && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          marginBottom: "32px"
        }}>
          <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
            Add New Auditorium
          </h4>
          <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>
                Auditorium Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>
                  Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={rows}
                  onChange={e => setRows(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#e50914"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>
                  Seats per Row
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={cols}
                  onChange={e => setCols(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#e50914"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, #e50914 0%, #c10812 100%)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(229, 9, 20, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Add Auditorium
            </button>
          </form>
        </div>
      )}

      {/* List of existing auditoriums */}
      {selectedTheaterId && (
        <>
          <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
            Existing Auditoriums
          </h4>

          {auditoriums.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666",
              fontSize: "16px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
            }}>
              No auditoriums yet. Add your first auditorium above.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {auditoriums.map(a => (
                <div
                  key={a.id}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.12)";
                    e.currentTarget.style.borderColor = "#e50914";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "12px" }}>
                    🎬
                  </div>
                  <h5 style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#221f1f",
                    marginBottom: "8px",
                    textAlign: "center"
                  }}>
                    {a.name}
                  </h5>
                  <p style={{
                    fontSize: "14px",
                    color: "#666",
                    textAlign: "center",
                    margin: 0
                  }}>
                    {a.seat_rows} rows × {a.seat_cols} seats
                  </p>
                  <DeleteButton onClick={() => handleDelete(a.id, a.name)} label="Delete Auditorium" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===== Movies + Showtimes tab =====

/**
 * Admin tab for managing:
 *  - movie creation
 *  - showtime creation (movie + theater + auditorium + schedule)
 */
function AdminShowtimesTab() {
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [auditoriums, setAuditoriums] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // Showtime form state
  const [theaterId, setTheaterId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [auditoriumId, setAuditoriumId] = useState("");
  const [showDate, setShowDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [price, setPrice] = useState("12.50");

  // New movie form state
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieGenre, setNewMovieGenre] = useState("");
  const [newMovieDuration, setNewMovieDuration] = useState("120");
  const [newMoviePoster, setNewMoviePoster] = useState("");
  const [newMovieDesc, setNewMovieDesc] = useState("");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Initial data: theaters + movies
  useEffect(() => {
    api
      .adminListTheaters()
      .then(setTheaters)
      .catch(e => setError(e.message));

    api
      .adminListMovies()
      .then(setMovies)
      .catch(e => setError(e.message));
  }, []);

  // When theater changes, load auditoriums for that theater
  useEffect(() => {
    if (!theaterId) {
      setAuditoriums([]);
      setAuditoriumId("");
      return;
    }
    api
      .adminListAuditoriums(theaterId)
      .then(data => {
        setAuditoriums(data);
        // Auto-select first auditorium if none selected yet
        if (data.length && !auditoriumId) {
          setAuditoriumId(String(data[0].id));
        }
      })
      .catch(e => setError(e.message));
  }, [theaterId]);

  // Handle movie creation
  async function handleCreateMovie(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      const movie = await api.adminCreateMovie({
        title: newMovieTitle,
        genre: newMovieGenre || null,
        durationMinutes: Number(newMovieDuration),
        releaseDate: null,
        description: newMovieDesc || null,
        posterUrl: newMoviePoster || null
      });

      // Reset form
      setNewMovieTitle("");
      setNewMovieGenre("");
      setNewMovieDuration("120");
      setNewMoviePoster("");
      setNewMovieDesc("");

      setMsg(`Movie "${movie.title}" created`);

      // Refresh movie list
      const data = await api.adminListMovies();
      setMovies(data);
    } catch (e) {
      setError(e.message);
    }
  }

  // Handle showtime creation
  async function handleCreateShowtime(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!theaterId || !movieId || !auditoriumId || !showDate) {
      setError("Fill all fields");
      return;
    }

    try {
      await api.adminCreateShowtime({
        movieId: Number(movieId),
        theaterId: Number(theaterId),
        auditoriumId: Number(auditoriumId),
        showDate,
        startTime,
        endTime,
        price: Number(price)
      });
      setMsg("Showtime created");
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteMovie(movieId, title) {
    if (!window.confirm(`Delete movie "${title}" and ALL its showtimes and bookings?`)) return;
    setError("");
    setMsg("");
    try {
      await api.adminDeleteMovie(movieId);
      setMsg(`Movie "${title}" deleted`);
      const data = await api.adminListMovies();
      setMovies(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteShowtime(showtimeId, details) {
    if (!window.confirm(`Delete showtime ${details}?`)) return;
    setError("");
    setMsg("");
    try {
      await api.adminDeleteShowtime(showtimeId);
      setMsg("Showtime deleted");
      // Refresh showtime list
    } catch (e) {
      setError(e.message);
    }
  }

  const inputStyle = {
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.3s ease"
  };

  const buttonStyle = {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#221f1f" }}>
        Movies & Showtimes
      </h3>

      {error && (
        <div style={{
          background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
          borderLeft: "4px solid #e50914",
          color: "#c62828",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {error}
        </div>
      )}

      {msg && (
        <div style={{
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
          borderLeft: "4px solid #4caf50",
          color: "#2e7d32",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {msg}
        </div>
      )}

      {/* Create movie form */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "24px"
      }}>
        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
          Create Movie
        </h4>
        <form onSubmit={handleCreateMovie} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Title</label>
            <input value={newMovieTitle} onChange={e => setNewMovieTitle(e.target.value)} required style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Genre</label>
              <input value={newMovieGenre} onChange={e => setNewMovieGenre(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Duration (min)</label>
              <input type="number" min="1" value={newMovieDuration} onChange={e => setNewMovieDuration(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Poster URL</label>
            <input value={newMoviePoster} onChange={e => setNewMoviePoster(e.target.value)} style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Description</label>
            <textarea value={newMovieDesc} onChange={e => setNewMovieDesc(e.target.value)} rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <button type="submit" style={buttonStyle}
            onMouseEnter={(e) => { e.target.style.background = "linear-gradient(135deg, #e50914 0%, #c10812 100%)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(229, 9, 20, 0.3)"; }}
            onMouseLeave={(e) => { e.target.style.background = "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
            Add Movie
          </button>
        </form>
      </div>

      {/* Movies list with delete button */}
      <div style={{ marginTop: "40px" }}>
        <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
          Existing Movies
        </h4>
        {movies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "12px" }}>No movies yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {movies.map(m => (
              <div key={m.id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: "100%", borderRadius: "8px", marginBottom: "12px" }} />}
                <h5 style={{ fontWeight: "700", fontSize: "18px" }}>{m.title}</h5>
                <p><strong>Genre:</strong> {m.genre || "—"}</p>
                <p><strong>Duration:</strong> {m.duration_minutes} min</p>
                {m.description && <p style={{ fontSize: "14px", color: "#666" }}>{m.description.substring(0, 100)}...</p>}
                <DeleteButton onClick={() => handleDeleteMovie(m.id, m.title)} label="Delete Movie" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create showtime form */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
      }}>
        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
          Create Showtime
        </h4>
        <form onSubmit={handleCreateShowtime} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Theater</label>
              <select value={theaterId} onChange={e => setTheaterId(e.target.value)} required
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                <option value="">Select theater</option>
                {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Auditorium</label>
              <select value={auditoriumId} onChange={e => setAuditoriumId(e.target.value)} required
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                <option value="">Select auditorium</option>
                {auditoriums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Movie</label>
            <select value={movieId} onChange={e => setMovieId(e.target.value)} required
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
              <option value="">Select movie</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Date</label>
              <input type="date" value={showDate} onChange={e => setShowDate(e.target.value)} required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Price ($)</label>
            <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <button type="submit" style={buttonStyle}
            onMouseEnter={(e) => { e.target.style.background = "linear-gradient(135deg, #e50914 0%, #c10812 100%)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(229, 9, 20, 0.3)"; }}
            onMouseLeave={(e) => { e.target.style.background = "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
            Add Showtime
          </button>
        </form>
      </div>
      {/* === Existing Showtimes === */}
<div>
  <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Existing Showtimes</h4>
  {showtimes.length === 0 ? (
    <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      No showtimes yet.
    </div>
  ) : (
    <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f1" }}>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Date</th>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Time</th>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Movie</th>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Theater</th>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Auditorium</th>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Price</th>
            <th style={{ textAlign: "left", padding: "16px", fontWeight: "700" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {showtimes.map(s => {
            const safeDate = s.show_date ? new Date(s.show_date).toLocaleDateString() : '—';
            const safeTime = (ts) => {
              if (!ts) return '—';
              const d = new Date(ts);
              return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };
            const start = safeTime(s.start_time);
            const end = safeTime(s.end_time);
            const details = `${s.movie_title} (${s.theater_name}, ${s.auditorium_name || "—"}) on ${safeDate} ${start}-${end}`;

            return (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <td style={{ padding: "14px 16px" }}>{safeDate}</td>
                <td style={{ padding: "14px 16px" }}>{start} - {end}</td>
                <td style={{ padding: "14px 16px", fontWeight: "600" }}>{s.movie_title}</td>
                <td style={{ padding: "14px 16px" }}>{s.theater_name}</td>
                <td style={{ padding: "14px 16px" }}>{s.auditorium_name || "—"}</td>
                <td style={{ padding: "14px 16px" }}>${Number(s.price).toFixed(2)}</td>
                <td style={{ padding: "14px 16px" }}>
                  <DeleteButton onClick={() => handleDeleteShowtime(s.id, details)} label="Delete" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>
    </div>

    
  );
}

// ===== Employees tab =====

/**
 * Admin tab for managing employees:
 *  - create employee/admin account
 *  - assign to theater
 *  - list all employees with their theater
 */
function AdminEmployeesTab() {
  const [theaters, setTheaters] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theaterId, setTheaterId] = useState("");
  const [role, setRole] = useState("employee");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Fetch theaters + employees together
  async function load() {
    try {
      setError("");
      const [ths, emps] = await Promise.all([
        api.adminListTheaters(),
        api.adminListEmployees()
      ]);
      setTheaters(ths);
      setEmployees(emps);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Handle creation of a new employee/admin
  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!theaterId) {
      setError("Select theater");
      return;
    }

    try {
      await api.adminCreateEmployee({
        name,
        email,
        password,
        theaterId: Number(theaterId),
        role
      });

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("employee");
      setTheaterId("");

      setMsg("Employee created");

      await load(); // refresh list
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteEmployee(employeeId, name) {
    if (!window.confirm(`Delete employee "${name}"?`)) return;
    setError("");
    setMsg("");
    try {
      await api.adminDeleteEmployee(employeeId);
      setMsg(`Employee "${name}" deleted`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const inputStyle = {
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.3s ease"
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#221f1f" }}>
        Employees
      </h3>

      {error && (
        <div style={{
          background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
          borderLeft: "4px solid #e50914",
          color: "#c62828",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {error}
        </div>
      )}

      {msg && (
        <div style={{
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
          borderLeft: "4px solid #4caf50",
          color: "#2e7d32",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {msg}
        </div>
      )}

      {/* Form: create new employee/admin */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "32px"
      }}>
        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
          Add New Employee
        </h4>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Theater</label>
              <select value={theaterId} onChange={e => setTheaterId(e.target.value)} required
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                <option value="">Select theater</option>
                {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
            onMouseEnter={(e) => { e.target.style.background = "linear-gradient(135deg, #e50914 0%, #c10812 100%)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(229, 9, 20, 0.3)"; }}
            onMouseLeave={(e) => { e.target.style.background = "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
            Add Employee
          </button>
        </form>
      </div>

      {/* Employees table */}
      <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
        Existing Employees
      </h4>

      {employees.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#666",
          fontSize: "16px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}>
          No employees yet. Add your first employee above.
        </div>
      ) : (
        <div style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #f5f5f1 0%, #e8e8e3 100%)" }}>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Name
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Email
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Role
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Theater
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} style={{ transition: "background 0.2s ease" }}
                  onMouseEnter={(ev) => ev.currentTarget.style.background = "#f9f9f9"}
                  onMouseLeave={(ev) => ev.currentTarget.style.background = "white"}>
                    
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#221f1f" }}>
                    {e.name}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#666" }}>
                    {e.email}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px" }}>
                    <span style={{
                      padding: "4px 12px",
                      background: e.role === "admin" ? "linear-gradient(135deg, #e50914 0%, #c10812 100%)" : "linear-gradient(135deg, #f5f5f1 0%, #e8e8e3 100%)",
                      color: e.role === "admin" ? "white" : "#221f1f",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "capitalize"
                    }}>
                      {e.role}
                    </span>
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#666" }}>
                    {e.theater_name || "—"}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px" }}>
                    <DeleteButton onClick={() => handleDeleteEmployee(e.id, e.name)} label="Delete Employee" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== Bookings tab =====

/**
 * Admin tab for viewing bookings:
 *  - filter by theater
 *  - filter by date range
 *  - see booking totals and statuses
 */
function AdminBookingsTab() {
  const [theaters, setTheaters] = useState([]);
  const [theaterId, setTheaterId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bookings, setBookings] = useState([]);

  const [error, setError] = useState("");

  // Load list of theaters for filtering
  useEffect(() => {
    api
      .adminListTheaters()
      .then(setTheaters)
      .catch(e => setError(e.message));
  }, []);

  // Fetch bookings with current filters
  async function load() {
    setError("");
    try {
      const data = await api.adminListBookings({
        theaterId: theaterId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      });
      setBookings(data);
    } catch (e) {
      setError(e.message);
    }
  }

  // Initial bookings load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    load();
  }

  const inputStyle = {
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.3s ease"
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#221f1f" }}>
        Bookings
      </h3>

      {error && (
        <div style={{
          background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
          borderLeft: "4px solid #e50914",
          color: "#c62828",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontWeight: "600"
        }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "32px"
      }}>
        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
          Filter Bookings
        </h4>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>Theater</label>
              <select value={theaterId} onChange={e => setTheaterId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                <option value="">All Theaters</option>
                {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#221f1f" }}>To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e50914"} onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
            </div>
          </div>
          <button type="submit" style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
            onMouseEnter={(e) => { e.target.style.background = "linear-gradient(135deg, #e50914 0%, #c10812 100%)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(229, 9, 20, 0.3)"; }}
            onMouseLeave={(e) => { e.target.style.background = "linear-gradient(135deg, #221f1f 0%, #1a1817 100%)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
            Apply Filters
          </button>
        </form>
      </div>

      {/* Bookings table */}
      <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#221f1f" }}>
        Booking Records
      </h4>

      {bookings.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#666",
          fontSize: "16px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}>
          No bookings found for the selected filters.
        </div>
      ) : (
        <div style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #f5f5f1 0%, #e8e8e3 100%)" }}>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Date
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Customer
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Movie
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Theater
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Status
                </th>
                <th style={{ borderBottom: "2px solid #e0e0e0", textAlign: "right", padding: "16px", fontWeight: "700", color: "#221f1f" }}>
                  Total €
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} style={{ transition: "background 0.2s ease" }}
                  onMouseEnter={(ev) => ev.currentTarget.style.background = "#f9f9f9"}
                  onMouseLeave={(ev) => ev.currentTarget.style.background = "white"}>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#666" }}>
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#221f1f" }}>
                    {b.customer_email}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#221f1f" }}>
                    {b.movie_title}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", color: "#666" }}>
                    {b.theater_name}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px" }}>
                    <span style={{
                      padding: "4px 12px",
                      background: b.status === "confirmed" ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)" : "linear-gradient(135deg, #f5f5f1 0%, #e8e8e3 100%)",
                      color: b.status === "confirmed" ? "white" : "#221f1f",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "capitalize"
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: "14px 16px", textAlign: "right", fontWeight: "600", color: "#221f1f" }}>
                    {Number(b.total_amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== AdminDashboard main =====

/**
 * Main admin dashboard component.
 * Renders tab navigation and active tab content.
 */
export default function AdminDashboard() {
  const [tab, setTab] = useState("theaters");

  return (
    <div>
      <h2>Admin panel</h2>
      <div style={{ display: "flex", gap: 8, margin: "12px 0 20px" }}>
        <TabButton active={tab === "theaters"} onClick={() => setTab("theaters")}>Theaters</TabButton>
        <TabButton active={tab === "auditoriums"} onClick={() => setTab("auditoriums")}>Auditoriums</TabButton>
        <TabButton active={tab === "showtimes"} onClick={() => setTab("showtimes")}>Movies & Showtimes</TabButton>
        <TabButton active={tab === "employees"} onClick={() => setTab("employees")}>Employees</TabButton>
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>Bookings</TabButton>
      </div>

      {tab === "theaters" && <AdminTheatersTab />}
      {tab === "auditoriums" && <AdminAuditoriumsTab />}
      {tab === "showtimes" && <AdminShowtimesTab />}
      {tab === "employees" && <AdminEmployeesTab />}
      {tab === "bookings" && <AdminBookingsTab />}
    </div>
  );
}
