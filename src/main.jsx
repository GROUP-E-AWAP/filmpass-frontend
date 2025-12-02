import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./authContext.jsx";

// Entry point: create root React tree and wrap it in Router + Auth context
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing */}
    <BrowserRouter>
      {/* AuthProvider stores user session + login/register logic */}
      <AuthProvider>
        {/* Main application layout */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
