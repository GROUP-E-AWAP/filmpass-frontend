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

  return (
    <div>
      <h3>Theaters</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* Form: create new theater */}
      <form
        onSubmit={handleCreate}
        style={{ maxWidth: 400, display: "grid", gap: 8, marginBottom: 20 }}
      >
        <label>
          Name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Location
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
        </label>
        <button type="submit">Add theater</button>
      </form>

      {/* List of existing theaters */}
      <h4>Existing theaters</h4>
      <ul>
        {theaters.map(t => (
          <li key={t.id}>
            <b>{t.name}</b> — {t.location}
          </li>
        ))}
        {theaters.length === 0 && <li>No theaters yet.</li>}
      </ul>
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

  return (
    <div>
      <h3>Auditoriums</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* Theater selector for context */}
      <label>
        Theater:
        <select
          value={selectedTheaterId}
          onChange={e => setSelectedTheaterId(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          <option value="">Select theater</option>
          {theaters.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {/* Form: create new auditorium inside selected theater */}
      <form
        onSubmit={handleCreate}
        style={{ maxWidth: 400, display: "grid", gap: 8, marginTop: 16 }}
      >
        <label>
          Name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Rows
          <input
            type="number"
            min="1"
            max="30"
            value={rows}
            onChange={e => setRows(e.target.value)}
          />
        </label>
        <label>
          Seats per row
          <input
            type="number"
            min="1"
            max="40"
            value={cols}
            onChange={e => setCols(e.target.value)}
          />
        </label>
        <button type="submit">Add auditorium</button>
      </form>

      {/* List of existing auditoriums for current theater */}
      <h4 style={{ marginTop: 16 }}>Existing auditoriums</h4>
      <ul>
        {auditoriums.map(a => (
          <li key={a.id}>
            <b>{a.name}</b> — {a.seat_rows} rows × {a.seat_cols} seats
          </li>
        ))}
        {selectedTheaterId && auditoriums.length === 0 && (
          <li>No auditoriums yet.</li>
        )}
      </ul>
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

  return (
    <div>
      <h3>Movies & showtimes</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* Block: create a new movie */}
      <h4>Create movie</h4>
      <form
        onSubmit={handleCreateMovie}
        style={{ maxWidth: 500, display: "grid", gap: 8, marginBottom: 20 }}
      >
        <label>
          Title
          <input
            value={newMovieTitle}
            onChange={e => setNewMovieTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Genre
          <input
            value={newMovieGenre}
            onChange={e => setNewMovieGenre(e.target.value)}
          />
        </label>
        <label>
          Duration (minutes)
          <input
            type="number"
            min="1"
            value={newMovieDuration}
            onChange={e => setNewMovieDuration(e.target.value)}
          />
        </label>
        <label>
          Poster URL
          <input
            value={newMoviePoster}
            onChange={e => setNewMoviePoster(e.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            value={newMovieDesc}
            onChange={e => setNewMovieDesc(e.target.value)}
            rows={3}
          />
        </label>
        <button type="submit">Add movie</button>
      </form>

      {/* Block: create a new showtime */}
      <h4>Create showtime</h4>
      <form
        onSubmit={handleCreateShowtime}
        style={{ maxWidth: 500, display: "grid", gap: 8 }}
      >
        <label>
          Theater
          <select
            value={theaterId}
            onChange={e => setTheaterId(e.target.value)}
            required
          >
            <option value="">Select theater</option>
            {theaters.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Auditorium
          <select
            value={auditoriumId}
            onChange={e => setAuditoriumId(e.target.value)}
            required
          >
            <option value="">Select auditorium</option>
            {auditoriums.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Movie
          <select
            value={movieId}
            onChange={e => setMovieId(e.target.value)}
            required
          >
            <option value="">Select movie</option>
            {movies.map(m => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={showDate}
            onChange={e => setShowDate(e.target.value)}
            required
          />
        </label>
        <label>
          Start time
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
          />
        </label>
        <label>
          End time
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            required
          />
        </label>
        <label>
          Price
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </label>
        <button type="submit">Add showtime</button>
      </form>
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

  return (
    <div>
      <h3>Employees</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* Form: create new employee/admin */}
      <form
        onSubmit={handleCreate}
        style={{ maxWidth: 400, display: "grid", gap: 8, marginBottom: 20 }}
      >
        <label>
          Name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Theater
          <select
            value={theaterId}
            onChange={e => setTheaterId(e.target.value)}
            required
          >
            <option value="">Select theater</option>
            {theaters.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Role
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit">Add employee</button>
      </form>

      {/* Employees table */}
      <h4>Existing employees</h4>
      <table
        style={{ borderCollapse: "collapse", width: "100%", maxWidth: 700 }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "1px solid #ddd",
                textAlign: "left",
                padding: 4
              }}
            >
              Name
            </th>
            <th
              style={{
                borderBottom: "1px solid #ddd",
                textAlign: "left",
                padding: 4
              }}
            >
              Email
            </th>
            <th
              style={{
                borderBottom: "1px solid #ddd",
                textAlign: "left",
                padding: 4
              }}
            >
              Role
            </th>
            <th
              style={{
                borderBottom: "1px solid #ddd",
                textAlign: "left",
                padding: 4
              }}
            >
              Theater
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {e.name}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {e.email}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {e.role}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {e.theater_name || "—"}
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 4 }}>
                No employees yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

  return (
    <div>
      <h3>Bookings</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Filters: theater + date range */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}
      >
        <label>
          Theater
          <select
            value={theaterId}
            onChange={e => setTheaterId(e.target.value)}
            style={{ marginLeft: 4 }}
          >
            <option value="">All</option>
            {theaters.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ marginLeft: 4 }}
          />
        </label>
        <button type="submit">Filter</button>
      </form>

      {/* Bookings table */}
      <table
        style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
              Date
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
              Customer
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
              Movie
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
              Theater
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
              Status
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
              Total €
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {new Date(b.created_at).toLocaleString()}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {b.customer_email}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {b.movie_title}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {b.theater_name}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {b.status}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 4 }}>
                {Number(b.total_amount).toFixed(2)}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 4 }}>
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0 20px" }}>
        <TabButton
          active={tab === "theaters"}
          onClick={() => setTab("theaters")}
        >
          Theaters
        </TabButton>
        <TabButton
          active={tab === "auditoriums"}
          onClick={() => setTab("auditoriums")}
        >
          Auditoriums
        </TabButton>
        <TabButton
          active={tab === "showtimes"}
          onClick={() => setTab("showtimes")}
        >
          Movies & showtimes
        </TabButton>
        <TabButton
          active={tab === "employees"}
          onClick={() => setTab("employees")}
        >
          Employees
        </TabButton>
        <TabButton
          active={tab === "bookings"}
          onClick={() => setTab("bookings")}
        >
          Bookings
        </TabButton>
      </div>

      {/* Active tab content */}
      {tab === "theaters" && <AdminTheatersTab />}
      {tab === "auditoriums" && <AdminAuditoriumsTab />}
      {tab === "showtimes" && <AdminShowtimesTab />}
      {tab === "employees" && <AdminEmployeesTab />}
      {tab === "bookings" && <AdminBookingsTab />}
    </div>
  );
}
