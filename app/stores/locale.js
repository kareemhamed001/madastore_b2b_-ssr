import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { messages } from "@/i18n/messages";

const LOCALE_STORAGE_KEY = "b2b_locale";
const SUPPORTED_LOCALES = ["en", "ar"];

function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : "ar";
}

function resolveInitialLocale() {
  if (import.meta.server) {
    return "ar";
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored) {
    return normalizeLocale(stored);
  }
  return "ar";
}

function getByPath(source, path) {
  return path.split(".").reduce((acc, key) => {
    if (!acc || typeof acc !== "object") {
      return undefined;
    }
    return acc[key];
  }, source);
}

function getByKeyOrPath(source, key) {
  if (!source || typeof source !== "object") {
    return undefined;
  }
  if (typeof source[key] === "string") {
    return source[key];
  }
  return getByPath(source, key);
}

function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export const useLocaleStore = defineStore("locale", () => {
  const locale = ref(resolveInitialLocale());

  const direction = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));
  const isArabic = computed(() => locale.value === "ar");
  const languageLabel = computed(() => (isArabic.value ? "EN" : "AR"));

  function applyDocumentAttrs(nextLocale) {
    if (import.meta.server) {
      return;
    }
    document.documentElement.setAttribute("lang", nextLocale);
    document.documentElement.setAttribute(
      "dir",
      nextLocale === "ar" ? "rtl" : "ltr",
    );
  }

  function setLocale(nextLocale) {
    locale.value = normalizeLocale(nextLocale);
  }

  function toggleLocale() {
    setLocale(locale.value === "ar" ? "en" : "ar");
  }

  function t(key, params = {}) {
    const activeMessage = getByKeyOrPath(messages[locale.value], key);
    const fallbackMessage = getByKeyOrPath(messages.en, key);
    const finalMessage =
      typeof activeMessage === "string"
        ? activeMessage
        : typeof fallbackMessage === "string"
          ? fallbackMessage
          : key;
    return interpolate(finalMessage, params);
  }

  watch(
    locale,
    (nextLocale) => {
      if (import.meta.client) {
        localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      }
      applyDocumentAttrs(nextLocale);
    },
    { immediate: true },
  );

  return {
    locale,
    direction,
    isArabic,
    languageLabel,
    setLocale,
    toggleLocale,
    t,
  };
});
