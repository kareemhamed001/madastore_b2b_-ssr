import { ref } from "vue";

/**
 * Composable for handling async operations with loading and error states
 * @param {Function} asyncFn - Async function to execute
 * @returns {object} Object with execute function, loading state, error state, and data
 */
export function useAsync(asyncFn) {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

  /**
   * Execute the async function
   * @param  {...any} args - Arguments to pass to the async function
   * @returns {Promise<any>} Result of the async function
   */
  async function execute(...args) {
    loading.value = true;
    error.value = null;
    data.value = null;

    try {
      const result = await asyncFn(...args);
      data.value = result;
      return result;
    } catch (err) {
      error.value = err.message || "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    execute,
    loading,
    error,
    data,
  };
}
