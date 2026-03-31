import { createError, deleteCookie, getCookie, getHeader, setCookie } from "h3";
import { useRuntimeConfig } from "#imports";

const AUTH_COOKIE_NAME = "b2b_auth_token";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function resolveApiBaseUrl(event) {
  const config = useRuntimeConfig(event);
  return normalizeBaseUrl(
    config?.public?.apiBaseUrl ||
      process.env.NUXT_PUBLIC_API_BASE_URL ||
      process.env.VITE_API_BASE_URL ||
      "https://madastore.net/api/v4",
  );
}

function resolveLocaleFromRequest(event) {
  const normalizeLocale = (value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();
    if (normalized.startsWith("en")) {
      return "en";
    }
    if (normalized.startsWith("ar")) {
      return "ar";
    }
    return null;
  };

  const explicitLocaleHeaders = ["x-locale", "app-language", "x-app-language"];
  for (const headerName of explicitLocaleHeaders) {
    const locale = normalizeLocale(getHeader(event, headerName));
    if (locale) {
      return locale;
    }
  }

  const acceptLanguage = String(getHeader(event, "accept-language") || "");
  const acceptedLocales = acceptLanguage.split(",").map((entry) => {
    return entry.split(";")[0].trim();
  });

  for (const language of acceptedLocales) {
    const locale = normalizeLocale(language);
    if (locale) {
      return locale;
    }
  }

  return "ar";
}

function parseErrorPayload(payload, fallbackStatus) {
  if (!payload) {
    return `HTTP error! status: ${fallbackStatus}`;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return String(payload.errors[0]);
  }

  if (payload.errors && typeof payload.errors === "object") {
    const firstError = Object.values(payload.errors).find((value) => {
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

    if (Array.isArray(firstError) && firstError.length > 0) {
      return String(firstError[0]);
    }

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return `HTTP error! status: ${fallbackStatus}`;
}

function parseBody(body) {
  if (typeof body !== "string") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export function setAuthTokenCookie(event, token) {
  if (!token) {
    return;
  }

  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export function clearAuthTokenCookie(event) {
  deleteCookie(event, AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function getAuthTokenFromCookie(event) {
  return getCookie(event, AUTH_COOKIE_NAME) || null;
}

export function requireAuthToken(event) {
  const token = getAuthTokenFromCookie(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    });
  }

  return token;
}

export function resolveTokenFromPayload(payload) {
  return (
    payload?.access_token ||
    payload?.token ||
    payload?.data?.access_token ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.result?.token ||
    null
  );
}

export function resolveUserFromPayload(payload) {
  const candidate =
    payload?.user ||
    payload?.data?.user ||
    payload?.data?.customer ||
    payload?.customer ||
    null;

  if (candidate && typeof candidate === "object") {
    return candidate;
  }

  if (payload && typeof payload === "object" && payload.id && payload.email) {
    return payload;
  }

  return null;
}

export async function backendFetch(event, endpoint, options = {}) {
  const { authToken = null, headers = {}, body, ...restOptions } = options;

  const locale = resolveLocaleFromRequest(event);

  const requestHeaders = {
    "Content-Type": "application/json",
    "Accept-Language": locale,
    "App-Language": locale,
    "X-Locale": locale,
    ...headers,
  };

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  try {
    return await $fetch(endpoint, {
      baseURL: resolveApiBaseUrl(event),
      method: restOptions.method,
      headers: requestHeaders,
      body: parseBody(body),
      ...restOptions,
    });
  } catch (error) {
    throw createError({
      statusCode: error?.statusCode || error?.status || 500,
      statusMessage: parseErrorPayload(
        error?.data,
        error?.statusCode || error?.status || 500,
      ),
    });
  }
}

export async function backendFetchFallback(event, endpoints, options = {}) {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      return await backendFetch(event, endpoint, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ||
    createError({
      statusCode: 502,
      statusMessage: "All API fallback endpoints failed",
    })
  );
}
