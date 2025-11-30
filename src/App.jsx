import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./style/global.css";

export default function App() {
  return (
    <div>
      <header>
        <div className="header-container">
          <Link to="/">
            <h1>FilmPass</h1>
          </Link>
          <Link to="/admin">Admin</Link>
        </div>
      </header>
      <main className="main-container">
        <Outlet />
      </main>
    </div>
  );
}
