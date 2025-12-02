import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

/**
 * Registration page.
 * Allows new users to create an account.
 *
 * Behavior:
 *  - Sends name/email/password to backend via auth context
 *  - On success: user is auto-logged-in (token returned) → redirect to home
 *  - On failure: show backend error message
 */
export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const { register, loading } = useAuth(); // register() makes API call + stores token

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      // Attempt account creation
      await register(name, email, password);

      // Redirect to home after successful registration
      navigate("/");
    } catch (e) {
      // Show backend validation or conflict errors (email already exists, etc.)
      setErr(e.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 320, display: "grid", gap: 10, marginTop: 10 }}
      >
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>

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
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {/* Disable button while request is in progress */}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* Error message from backend or auth context */}
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
    </div>
  );
}
