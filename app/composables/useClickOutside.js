import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable for handling click outside of element
 * @param {Function} callback - Callback function to execute on click outside
 * @returns {Ref} Template ref to attach to the element
 */
export function useClickOutside(callback) {
  const elementRef = ref(null);

  /**
   * Handle click event
   * @param {Event} event - Click event
   */
  function handleClick(event) {
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      callback();
    }
  }

  onMounted(() => {
    document.addEventListener("click", handleClick);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClick);
  });

  return elementRef;
}
