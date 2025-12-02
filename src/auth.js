const BASE = import.meta.env.VITE_API_BASE || "/api";

// Generic helper for authenticated/unauthed JSON API calls
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  // Try to parse JSON, but fallback to empty object on failure
  const data = await res.json().catch(() => ({}));

  // Surface backend errors in a readable way
  if (!res.ok) {
    throw new Error(data.error || `${res.status} ${res.statusText}`);
  }

  return data;
}

// ===== AUTH ACTIONS =====

// Register new user (customer by default)
export async function registerUser({ name, email, password }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
}

// Login existing user → returns token + user info
export async function loginUser({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

// Fetch current user info based on stored JWT token
export async function fetchMe() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);

  return data;
}

// ===== LOCAL STORAGE KEYS =====
const TOKEN_KEY = "filmpass_token";
const USER_KEY = "filmpass_user";

// Save JWT token + user profile to localStorage
export function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear auth info (logout)
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Retrieve stored JWT
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Retrieve stored user profile, safely parsing JSON
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
