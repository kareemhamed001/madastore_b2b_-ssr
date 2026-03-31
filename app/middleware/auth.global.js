import { useAuthStore } from "@/stores/auth";

function resolveSafeRedirect(value) {
  if (typeof value !== "string") {
    return "/";
  }

  const normalized = value.trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/";
  }

  return normalized;
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initialize();
  }

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    return navigateTo({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  if (to.meta?.guestOnly && authStore.isAuthenticated) {
    const redirect = resolveSafeRedirect(to.query.redirect);
    return navigateTo(redirect);
  }
});
