import React from "react";
import { Routes, Route } from "react-router-dom";
import Theaters from "./pages/Theaters.jsx";
import Home from "./pages/Home.jsx";
import Movie from "./pages/Movie.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import NavBar from "./components/NavBar.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    // Main app layout container (header + routed content + footer)
    <div className="container">
      {/* Global navigation bar */}
      <NavBar />

      {/* Page content rendered by React Router */}
      <main>
        <Routes>
          {/* List of theaters */}
          <Route path="/" element={<Theaters />} />

          {/* List of movies for a specific theater */}
          <Route path="/theater/:theaterId" element={<Home />} />

          {/* Movie details + showtimes + seat booking */}
          <Route path="/movie/:id" element={<Movie />} />

          {/* Auth pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Admin section (protected by user roles) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "employee"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Simple footer */}
      <footer>
        <span>North Star Cinemas · Demo project</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
