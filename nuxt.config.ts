import tailwindcss from "@tailwindcss/vite";

const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ||
  {};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: env.NODE_ENV !== "production" },
  modules: ["@pinia/nuxt"],
  css: ["@/assets/main.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl:
        env.NUXT_PUBLIC_API_BASE_URL ||
        env.VITE_API_BASE_URL ||
        "https://madastore.net/api/v4",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
