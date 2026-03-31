import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authAPI } from "@/services/api";

const AUTH_USER_STORAGE_KEY = "b2b_auth_user";

function isSensitiveUserField(key) {
  const normalized = String(key || "").toLowerCase();

  return (
    normalized.includes("token") ||
    normalized.includes("access_token") ||
    normalized.includes("password") ||
    normalized.includes("secret") ||
    normalized.includes("authorization") ||
    normalized === "jwt"
  );
}

function stripSensitiveFields(value) {
  if (Array.isArray(value)) {
    return value.map((item) => stripSensitiveFields(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value).reduce((accumulator, [key, fieldValue]) => {
    if (isSensitiveUserField(key)) {
      return accumulator;
    }

    accumulator[key] = stripSensitiveFields(fieldValue);
    return accumulator;
  }, {});
}

function sanitizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return stripSensitiveFields(user);
}

function getStoredUser() {
  if (import.meta.server) {
    return null;
  }
  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    const safeUser = sanitizeUser(parsed);

    if (!safeUser) {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return null;
    }

    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  if (import.meta.server) {
    return;
  }
  const safeUser = sanitizeUser(user);

  if (!safeUser) {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(safeUser));
}

function resolveUserFromResponse(payload) {
  const candidate =
    payload?.user ||
    payload?.data?.user ||
    payload?.data?.customer ||
    payload?.customer ||
    null;

  if (candidate && typeof candidate === "object") {
    return sanitizeUser(candidate);
  }

  if (payload && typeof payload === "object" && payload.id && payload.email) {
    return sanitizeUser(payload);
  }

  return null;
}

export const useAuthStore = defineStore("auth", () => {
  const hasSession = ref(false);
  const user = ref(getStoredUser());
  const loading = ref(false);
  const initialized = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => {
    return hasSession.value || Boolean(user.value);
  });
  const userName = computed(() => {
    return (
      user.value?.name ||
      user.value?.username ||
      user.value?.full_name ||
      user.value?.email ||
      "Account"
    );
  });

  function setSession(nextUser = null) {
    const safeUser = sanitizeUser(nextUser || user.value);

    hasSession.value = true;
    user.value = safeUser;
    setStoredUser(safeUser);
  }

  function clearSession() {
    hasSession.value = false;
    user.value = null;
    setStoredUser(null);
  }

  async function fetchProfile() {
    const response = await authAPI.getProfile();
    const nextUser = sanitizeUser(resolveUserFromResponse(response));
    hasSession.value = true;

    if (nextUser) {
      user.value = nextUser;
      setStoredUser(nextUser);
    }
    return nextUser;
  }

  async function initialize() {
    if (initialized.value) {
      return;
    }

    if (import.meta.client) {
      const storedUser = getStoredUser();

      if (storedUser && !user.value) {
        user.value = storedUser;
      }
    }

    initialized.value = true;

    try {
      await fetchProfile();
    } catch {
      hasSession.value = false;
      if (!import.meta.server) {
        setStoredUser(null);
      }
    }
  }

  async function login(credentials) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authAPI.login(credentials);
      const nextUser = resolveUserFromResponse(response);
      setSession(nextUser);

      if (!nextUser) {
        try {
          await fetchProfile();
        } catch {
          // Keep token session even if profile endpoint is unavailable.
        }
      }

      return response;
    } catch (err) {
      error.value = err?.message || "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authAPI.register(payload);
      const nextUser = resolveUserFromResponse(response);
      const authenticated = Boolean(response?.authenticated);

      if (authenticated) {
        setSession(nextUser);
        if (!nextUser) {
          try {
            await fetchProfile();
          } catch {
            // Keep token session even if profile endpoint is unavailable.
          }
        }
      }

      return response;
    } catch (err) {
      error.value = err?.message || "Registration failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    clearSession();
    error.value = null;

    try {
      await authAPI.logout();
    } catch {
      // Local logout should succeed even if API logout fails.
    }
  }

  async function updateProfile(payload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authAPI.updateProfile(payload);
      const updatedUser = sanitizeUser(resolveUserFromResponse(response));
      if (updatedUser) {
        user.value = updatedUser;
        setStoredUser(updatedUser);
      }
      return response;
    } catch (err) {
      error.value = err?.message || "Failed to update profile";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    hasSession,
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    userName,
    initialize,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    clearSession,
  };
});
