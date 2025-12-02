import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./authContext.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";

// Entry point: create root React tree and wrap it in Router + Auth context
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing */}
    <BrowserRouter>
      {/* AuthProvider stores user session + login/register logic */}
      <AuthProvider>
        {/* Main application layout */}
        <App />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
