import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { priceListRequestAPI } from "@/services/api";

/**
 * Price List Request Store
 * Manages price list requests
 */
export const usePriceListRequestStore = defineStore("priceListRequest", () => {
  // State
  const requests = ref([]);
  const currentRequest = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const allRequests = computed(() => requests.value);

  const pendingRequests = computed(() => {
    return requests.value.filter((req) => req.status === "pending");
  });

  const confirmedRequests = computed(() => {
    return requests.value.filter((req) => req.status === "confirmed");
  });

  const rejectedRequests = computed(() => {
    return requests.value.filter((req) => req.status === "rejected");
  });

  // Actions
  /**
   * Create a new price list request
   * @param {object} requestData - Request data
   * @returns {Promise<object>} Created request
   */
  async function createRequest(requestData) {
    loading.value = true;
    error.value = null;

    try {
      const data = await priceListRequestAPI.create(requestData);
      requests.value.unshift(data);
      currentRequest.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Error creating price list request:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch all price list requests
   */
  async function fetchRequests() {
    loading.value = true;
    error.value = null;

    try {
      const data = await priceListRequestAPI.getAll();
      requests.value = data.data.data || data;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching price list requests:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch a specific price list request by ID
   * @param {number|string} id - Request ID
   */
  async function fetchRequestById(id) {
    loading.value = true;
    error.value = null;
    currentRequest.value = null;

    try {
      const data = await priceListRequestAPI.getById(id);
      currentRequest.value = data.data || data;
      return currentRequest.value;
    } catch (err) {
      currentRequest.value = null;
      error.value = err.message;
      console.error("Error fetching price list request:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a price list request by ID
   * @param {number|string} id - Request ID
   */
  async function deleteRequest(id) {
    loading.value = true;
    error.value = null;

    try {
      await priceListRequestAPI.delete(id);
      requests.value = requests.value.filter((req) => req.id !== id);
    } catch (err) {
      error.value = err.message;
      console.error("Error deleting price list request:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function printRequest(id) {
    loading.value = true;
    error.value = null;

    try {
      const data = await priceListRequestAPI.print(id);
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Error printing price list request:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    requests,
    currentRequest,
    loading,
    error,

    // Getters
    allRequests,
    pendingRequests,
    confirmedRequests,
    rejectedRequests,

    // Actions
    createRequest,
    fetchRequests,
    fetchRequestById,
    deleteRequest,
    printRequest,
  };
});
