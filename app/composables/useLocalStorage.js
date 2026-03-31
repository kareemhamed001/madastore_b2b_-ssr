import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable for localStorage with reactive updates
 * @param {string} key - LocalStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {object} Object with value ref and save/remove functions
 */
export function useLocalStorage(key, defaultValue = null) {
  const value = ref(defaultValue);

  /**
   * Load value from localStorage
   */
  function load() {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        value.value = JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }

  /**
   * Save value to localStorage
   */
  function save(newValue) {
    try {
      value.value = newValue;
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  /**
   * Remove value from localStorage
   */
  function remove() {
    try {
      value.value = defaultValue;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  /**
   * Handle storage events from other tabs/windows
   * @param {StorageEvent} event - Storage event
   */
  function handleStorageChange(event) {
    if (event.key === key) {
      try {
        value.value = event.newValue
          ? JSON.parse(event.newValue)
          : defaultValue;
      } catch (error) {
        console.error(`Error parsing storage event for ${key}:`, error);
      }
    }
  }

  onMounted(() => {
    load();
    window.addEventListener("storage", handleStorageChange);
  });

  onUnmounted(() => {
    window.removeEventListener("storage", handleStorageChange);
  });

  return {
    value,
    save,
    remove,
  };
}
