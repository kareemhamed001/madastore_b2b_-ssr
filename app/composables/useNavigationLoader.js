import { readonly } from "vue";
import { useState } from "#imports";

let hideTimer = null;

export function startNavigationLoading() {
  const isNavigationLoadingState = useState("navigation-loading", () => false);
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  isNavigationLoadingState.value = true;
}

export function stopNavigationLoading() {
  const isNavigationLoadingState = useState("navigation-loading", () => false);
  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  // Short delay avoids progress bar flicker on very fast navigations.
  hideTimer = setTimeout(() => {
    isNavigationLoadingState.value = false;
    hideTimer = null;
  }, 180);
}

export function useNavigationLoader() {
  const isNavigationLoadingState = useState("navigation-loading", () => false);
  return {
    isNavigationLoading: readonly(isNavigationLoadingState),
  };
}
