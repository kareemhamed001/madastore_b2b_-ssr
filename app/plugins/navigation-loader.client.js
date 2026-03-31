import {
  startNavigationLoading,
  stopNavigationLoading,
} from "@/composables/useNavigationLoader";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:start", () => {
    startNavigationLoading();
  });

  nuxtApp.hook("page:finish", () => {
    stopNavigationLoading();
  });

  nuxtApp.hook("app:error", () => {
    stopNavigationLoading();
  });
});
