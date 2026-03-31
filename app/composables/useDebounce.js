import { ref, watch } from "vue";

/**
 * Composable for debouncing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Ref} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value);
  let timeout = null;

  watch(
    () => value,
    (newValue) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        debouncedValue.value = newValue;
      }, delay);
    },
    { immediate: true },
  );

  return debouncedValue;
}
