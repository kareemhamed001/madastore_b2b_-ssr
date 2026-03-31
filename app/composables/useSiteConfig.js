import { ref } from "vue";
import { siteConfigAPI } from "@/services/siteConfig";
import { useState } from "#imports";

function applyFavicon(faviconUrl) {
  if (import.meta.server) {
    return;
  }

  const href = String(faviconUrl || "").trim();
  if (!href) {
    return;
  }

  const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]'];

  selectors.forEach((selector, index) => {
    let link = document.head.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      link.rel = index === 0 ? "icon" : "shortcut icon";
      document.head.appendChild(link);
    }
    link.href = href;
  });
}

function applyBranding(branding) {
  if (!branding || import.meta.server) {
    return;
  }

  const root = document.documentElement;
  const colors = branding.colors || {};

  const mappings = {
    "mada-primary": colors.primary,
    "mada-primary-hover": colors.primary_hover,
    "mada-dark": colors.dark,
    "mada-bg": colors.background,
    "mada-surface": colors.surface,
    "mada-soft": colors.soft,
    "mada-border": colors.border,
    "mada-muted": colors.muted,
  };

  Object.entries(mappings).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(`--${key}`, value);
    }
  });

  const typography = branding.typography || {};
  if (typography.font_family) {
    document.body.style.fontFamily = typography.font_family;
  }

  if (typography.font_url) {
    const id = "brand-font";
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = typography.font_url;
  }

  applyFavicon(branding?.logo?.favicon_url);
}

export function useSiteConfig(defaults) {
  const branding = useState(
    "siteConfig-branding",
    () => defaults?.branding || null,
  );
  const footer = useState("siteConfig-footer", () => defaults?.footer || null);
  const error = ref(null);
  const loading = ref(false);

  async function load(locale = null) {
    loading.value = true;
    error.value = null;

    try {
      const data = await siteConfigAPI.getSiteConfig(locale);
      branding.value = data?.branding || branding.value;
      footer.value = data?.footer || footer.value;
      applyBranding(branding.value);
    } catch (err) {
      error.value = err;
      applyBranding(branding.value);
    } finally {
      loading.value = false;
    }
  }

  return {
    branding,
    footer,
    error,
    loading,
    load,
  };
}
