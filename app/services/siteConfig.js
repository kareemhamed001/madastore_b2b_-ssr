import { fetchAPI, LOCALE_STORAGE_KEY } from "./api";

function normalizeLocale(locale) {
  return locale === "en" ? "en" : "ar";
}

function resolveLocale(explicitLocale = null) {
  if (typeof explicitLocale === "string" && explicitLocale.trim()) {
    return normalizeLocale(explicitLocale.trim().toLowerCase());
  }

  if (import.meta.server) {
    return "ar";
  }

  return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
}

function appendLocaleQuery(endpoint, locale) {
  const query = `lang=${encodeURIComponent(locale)}&locale=${encodeURIComponent(locale)}`;
  return endpoint.includes("?")
    ? `${endpoint}&${query}`
    : `${endpoint}?${query}`;
}

async function fetchWithFallback(endpoints, locale = null) {
  const activeLocale = resolveLocale(locale);
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const localizedEndpoint = appendLocaleQuery(endpoint, activeLocale);
      return await fetchAPI(localizedEndpoint, {
        headers: {
          "Accept-Language": activeLocale,
          "X-Locale": activeLocale,
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("All site config fallback endpoints failed");
}

export const siteConfigAPI = {
  async getSiteConfig(locale = null) {
    return fetchWithFallback(["/site-config"], locale);
  },
  async getBranding(locale = null) {
    return fetchWithFallback(["/branding", "/site-config/branding"], locale);
  },
  async getFooter(locale = null) {
    return fetchWithFallback(["/footer", "/site-config/footer"], locale);
  },
};
