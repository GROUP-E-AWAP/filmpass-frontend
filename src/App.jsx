import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/" style={{ textDecoration: "none", color: "#111" }}>
          <h1>FilmPass</h1>
        </Link>
      </header>
      <Outlet />
    </div>
  );
}
