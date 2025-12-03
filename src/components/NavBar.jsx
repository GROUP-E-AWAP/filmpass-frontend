import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header>
      {/* Logo + project name section */}
      <div className="header-logo">
        {/* App logo (static asset) */}
        <img
          src="/north-star-logo.jpg"
          alt="North Star"
          className="logo-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* Main navigation link to homepage */}
        <Link to="/" className="logo-link">
          <h1>FilmPass</h1>
        </Link>
      </div>

      {/* Main navigation section (movies, admin, auth controls) */}
      <nav>
        {/* Public link to movie list */}
        <Link to="/">Theaters</Link>

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
