import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header>
      {/* Logo + project name section */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* App logo (static asset) */}
        <img
          src="/north-star-logo.jpg"
          alt="North Star"
          style={{ height: 40, borderRadius: 6, objectFit: "cover" }}
        />

        {/* Main navigation link to homepage */}
        <Link to="/" style={{ textDecoration: "none", color: "black" }}>
          <h1>FilmPass</h1>
        </Link>
      </div>

      {/* Main navigation section (movies, admin, auth controls) */}
      <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Public link to movie list */}
        <Link to="/">Movies</Link>

        {/* Admin link shown only for authenticated users with admin/employee roles */}
        {user && (user.role === "admin" || user.role === "employee") && (
          <Link to="/admin">Admin</Link>
        )}

        {/* Authenticated user controls */}
        {user ? (
          <>
            {/* Display current user email */}
            <span className="username">
              Logged in as <b>{user.email}</b>
            </span>

            {/* Logout button triggers auth context logout */}
            <button type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          /* Unauthenticated users see login + register links */
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
