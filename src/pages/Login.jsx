import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

/**
 * Login page.
 * Allows user to authenticate using email + password.
 *
 * Behavior:
 *  - On submit, calls `login` from auth context
 *  - On success → redirect to home page
 *  - On error → show message under the form
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // login() handles API call, token storage and user update
  const { login, loading } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      // Attempt login via auth context
      await login(email, password);

      // Redirect on success
      navigate("/");
    } catch (e) {
      // Any API or validation error is shown to the user
      setErr(e.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 320, display: "grid", gap: 10, marginTop: 10 }}
      >
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {/* Button shows loading state from context */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* API errors, wrong creds, etc. */}
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
    </div>
  );
}
