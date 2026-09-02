/**
 * auth.js — Real-time authentication service.
 *
 * All operations hit the backend API. No offline/demo fallback.
 * Tokens are stored in localStorage and attached to every request.
 */

const API_BASE_URL = "/api/v1";

// ── helpers ────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("authToken");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (res.ok) return res.json();
  let errorMsg = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (body.error) {
      errorMsg = body.error;
    } else if (body.message) {
      errorMsg = body.message;
    } else if (Array.isArray(body.detail) && body.detail.length > 0) {
      errorMsg = body.detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(", ");
    } else if (typeof body.detail === "string" && body.detail !== "HTTPException") {
      errorMsg = body.detail;
    }
  } catch (_) {}
  throw new Error(errorMsg);
}

// ── authService ────────────────────────────────────────────────────────────

export const authService = {
  // ------------------------------------------------------------------
  // Login with email + password
  // ------------------------------------------------------------------
  login: async ({ email, password }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(res);

    const token = data.access_token;
    const refreshToken = data.refresh_token;

    // Fetch full profile so we have name, phone, role, etc.
    const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profile = await handleResponse(profileRes);

    const user = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      full_name: profile.full_name,
      phone_number: profile.phone_number || "",
      role: profile.role,
      preferred_language: profile.preferred_language || "en",
      token,
    };

    localStorage.setItem("authToken", token);
    localStorage.setItem("refreshToken", refreshToken || "");
    localStorage.setItem("user", JSON.stringify(user));

    return { success: true, user, token };
  },

  // ------------------------------------------------------------------
  // Register a new account
  // ------------------------------------------------------------------
  register: async ({ full_name, email, password, phone_number = "", role = "patient" }) => {
    const payload = {
      full_name,
      email,
      password,
      phone_number: (phone_number && typeof phone_number === "string") ? phone_number.trim() : "",
      role,
      preferred_language: "en",
    };

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await handleResponse(res); // throws on error

    // Auto-login after registration
    return authService.login({ email, password });
  },

  // Google sign-in removed: use email/password register/login instead.

  // ------------------------------------------------------------------
  // Update user profile (name, phone)
  // ------------------------------------------------------------------
  updateProfile: async (updatedData) => {
    const storedUserStr = localStorage.getItem("user");
    const currentUser = storedUserStr ? JSON.parse(storedUserStr) : {};

    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        full_name: updatedData.name || updatedData.full_name || currentUser.full_name,
        phone_number: updatedData.phone_number || updatedData.phone || currentUser.phone_number,
      }),
    });

    const profile = await handleResponse(res);

    const mergedUser = {
      ...currentUser,
      ...updatedData,
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      full_name: profile.full_name,
      phone_number: profile.phone_number,
    };

    localStorage.setItem("user", JSON.stringify(mergedUser));
    return mergedUser;
  },

  // ------------------------------------------------------------------
  // Update preferred language on the backend
  // ------------------------------------------------------------------
  updateLanguage: async (langCode) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile/language`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ preferred_language: langCode }),
    });
    return handleResponse(res);
  },

  // ------------------------------------------------------------------
  // Get current user from localStorage (no network call)
  // ------------------------------------------------------------------
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr);
    } catch (_) {}
    return null;
  },

  // ------------------------------------------------------------------
  // Logout — revoke token on backend then clear storage
  // ------------------------------------------------------------------
  logout: async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (_) {
        // If backend is unreachable, still clear local state
      }
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return { success: true };
  },
};
