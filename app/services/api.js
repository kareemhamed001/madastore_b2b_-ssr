/**
 * API service for Madastore B2B backend.
 * Provides centralized HTTP request handling with error parsing, locale management,
 * and fallback endpoint support for external and internal API calls.
 *
 * Features:
 * - Automatic Bearer token attachment for authenticated requests
 * - Error payload parsing with multiple fallback strategies
 * - Locale detection from localStorage with server-side fallback
 * - API base URL resolution from runtime config
 * - Fallback endpoint support for API compatibility
 * - Server-aware fetch implementation using useRequestFetch on server
 *
 * Exported APIs:
 * @exports {Object} categoryAPI - Category listing, search, and tree operations
 * @exports {Object} productAPI - Product CRUD and filtering operations
 * @exports {Object} authAPI - Authentication and user profile management
 * @exports {Object} priceListRequestAPI - Price list request handling
 * @exports {string} LOCALE_STORAGE_KEY - LocalStorage key for locale persistence
 * @exports {Function} fetchAPI - Generic fetch wrapper with error handling
 *
 * Dependencies:
 * - #imports: Nuxt auto-imports (useRequestFetch, useRuntimeConfig, $fetch)
 * - Requires runtime config with optional 'public.apiBaseUrl'
 * - Requires localStorage access on client side (gracefully handled on server)
 *
 * @module services/api
 */
/**
 * API service for Madastore backend.
 * Handles HTTP requests and endpoint fallbacks.
 */
import { useRequestFetch, useRuntimeConfig } from "#imports";

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  try {
    const config = useRuntimeConfig();
    if (config?.public?.apiBaseUrl) {
      return normalizeBaseUrl(config.public.apiBaseUrl);
    }
  } catch {
    // Falls back to env/static defaults when runtime config is unavailable.
  }

  return "https://madastore.net/api/v4";
}

export const LOCALE_STORAGE_KEY = "b2b_locale";

function getStoredLocale() {
  if (import.meta.server) {
    return "ar";
  }
  const locale = localStorage.getItem(LOCALE_STORAGE_KEY);
  return locale === "en" ? "en" : "ar";
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

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {boolean} options.auth - Attach Bearer token if available
 * @param {string|null} options.token - Explicit token override
 * @returns {Promise<any>} Response data
 */
export async function fetchAPI(endpoint, options = {}) {
  const {
    auth = false,
    token = null,
    headers = {},
    body,
    ...restOptions
  } = options;
  const baseURL = resolveApiBaseUrl();
  const locale = getStoredLocale();

  const requestHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": locale,
    "X-Locale": locale,
    ...headers,
  };

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Parse pre-stringified JSON bodies so $fetch handles serialization uniformly
  const requestBody = typeof body === "string" ? JSON.parse(body) : body;

  try {
    return await $fetch(endpoint, {
      baseURL,
      headers: requestHeaders,
      body: requestBody,
      ...restOptions,
    });
  } catch (error) {
    // ofetch FetchError exposes error.data (parsed body) and error.statusCode
    if (error?.data !== undefined || error?.statusCode) {
      throw new Error(
        parseErrorPayload(error.data, error.statusCode || error.status),
      );
    }
    throw error;
  }
}

async function fetchAPIFallback(endpoints, options = {}) {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      return await fetchAPI(endpoint, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("All API fallback endpoints failed");
}

function getServerAwareFetch() {
  if (import.meta.server) {
    try {
      return useRequestFetch();
    } catch {
      return $fetch;
    }
  }

  return $fetch;
}

async function fetchInternalAPI(endpoint, options = {}) {
  const requestFetch = getServerAwareFetch();
  const locale = getStoredLocale();
  const { body, headers = {}, ...restOptions } = options;

  const requestHeaders = {
    "Accept-Language": locale,
    "App-Language": locale,
    "X-Locale": locale,
    ...headers,
  };

  try {
    return await requestFetch(endpoint, {
      credentials: "include",
      headers: requestHeaders,
      body: typeof body === "string" ? JSON.parse(body) : body,
      ...restOptions,
    });
  } catch (error) {
    if (error?.data !== undefined || error?.statusCode) {
      throw new Error(
        parseErrorPayload(error.data, error.statusCode || error.status),
      );
    }
    throw error;
  }
}

/**
 * Category API methods.
 */
export const categoryAPI = {
  async getAll() {
    return fetchAPIFallback(["/categories"]);
  },

  async getById(id) {
    const data = await fetchAPIFallback([`/categories/${id}`]);

    const match = data.data || data?.category || data;
    if (!match) {
      throw new Error("Category not found");
    }
    return match;
  },

  async getTree() {
    return this.getAll();
  },

  async search(query) {
    const data = await fetchAPIFallback([
      "/categories?search=" + encodeURIComponent(query),
    ]);

    return data?.data || data?.categories || [];
  },

  async getSubCategories(id) {
    return fetchAPIFallback([`/sub-categories/${id}`]);
  },
};

function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (!value.length) {
        return;
      }
      query.set(key, value.join(","));
      return;
    }

    query.set(key, String(value));
  });

  return query.toString();
}

/**
 * Product API methods.
 */
export const productAPI = {
  async getAll(params = {}) {
    const queryString = buildQueryString(params);
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    return fetchAPI(endpoint);
  },

  async getById(id) {
    return fetchAPI(`/products/${id}`);
  },

  async getRelated(productId, params = {}) {
    const queryString = buildQueryString(params);
    const primaryEndpoint = queryString
      ? `/products/related/${productId}?${queryString}`
      : `/products/related/${productId}`;
    const fallbackEndpoint = queryString
      ? `/products/${productId}/related?${queryString}`
      : `/products/${productId}/related`;

    return fetchAPIFallback([primaryEndpoint, fallbackEndpoint]);
  },

  async getByCategory(categoryId, params = {}) {
    const queryString = buildQueryString(params);
    const endpoint = queryString
      ? `/products/category/${categoryId}?${queryString}`
      : `/products/category/${categoryId}`;

    const data = await fetchAPI(endpoint);
    return {
      products: data?.data || [],
      pagination: data?.meta
        ? {
            currentPage: data.meta.current_page,
            totalPages: data.meta.last_page,
            pageSize: data.meta.per_page,
            total: data.meta.total,
          }
        : null,
    };
  },

  async search(params = {}) {
    const normalizedParams =
      typeof params === "string"
        ? {
            name: params,
          }
        : params;
    const queryString = buildQueryString(normalizedParams);
    const endpoint = queryString
      ? `/products/search?${queryString}`
      : "/products/search";
    return fetchAPI(endpoint);
  },

  async getFilters(params = {}) {
    const queryString = buildQueryString(params);
    const endpoints = [
      queryString ? `/products/filters?${queryString}` : "/products/filters",
      queryString
        ? `/products/search/filters?${queryString}`
        : "/products/search/filters",
      queryString
        ? `/products/filter-options?${queryString}`
        : "/products/filter-options",
    ];

    return fetchAPIFallback(endpoints);
  },

  async getBrands() {
    return fetchAPI("/brands");
  },
};

/**
 * Authentication API methods.
 * Supports multiple endpoint variants to stay compatible with Madastore API versions.
 */
export const authAPI = {
  async login(credentials) {
    return fetchInternalAPI("/api/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async register(payload) {
    return fetchInternalAPI("/api/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  async logout() {
    return fetchInternalAPI("/api/auth/logout", {
      method: "POST",
    });
  },

  async getProfile() {
    return fetchInternalAPI("/api/auth/profile", {
      method: "GET",
    });
  },

  async updateProfile(payload) {
    return fetchInternalAPI("/api/auth/profile", {
      method: "PUT",
      body: payload,
    });
  },
};

/**
 * Price list request API methods.
 */
export const priceListRequestAPI = {
  async create(requestData) {
    return fetchInternalAPI("/api/price-list-requests", {
      method: "POST",
      body: requestData,
    });
  },

  async getAll() {
    return fetchInternalAPI("/api/price-list-requests", {
      method: "GET",
    });
  },

  async getById(id) {
    return fetchInternalAPI(`/api/price-list-requests/${id}`, {
      method: "GET",
    });
  },

  async delete(id) {
    return fetchInternalAPI(`/api/price-list-requests/${id}`, {
      method: "DELETE",
    });
  },

  async print(id) {
    return fetchInternalAPI(`/api/price-list-requests/${id}/print`, {
      method: "GET",
    });
  },
};

export const orderAPI = {
  async getAll() {
    return fetchInternalAPI("/api/purchase-history", { method: "GET" });
  },

  async getById(id) {
    return fetchInternalAPI(`/api/purchase-history/${id}`, {
      method: "GET",
    });
  },

  async getItems(id) {
    return fetchInternalAPI(`/api/purchase-history-items/${id}`, {
      method: "GET",
    });
  },
};

export default {
  categoryAPI,
  productAPI,
  authAPI,
  priceListRequestAPI,
  orderAPI,
};
