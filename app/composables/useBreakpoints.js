import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable for responsive design breakpoints
 * @returns {object} Object with reactive breakpoint states
 */
export function useBreakpoints() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);

  /**
   * Check and update breakpoints
   */
  function checkBreakpoints() {
    const width = window.innerWidth;

    isMobile.value = width < 768;
    isTablet.value = width >= 768 && width < 1024;
    isDesktop.value = width >= 1024;
  }

  onMounted(() => {
    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkBreakpoints);
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
}
