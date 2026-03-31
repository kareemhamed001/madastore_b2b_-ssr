import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { productAPI } from "@/services/api";

/**
 * Product Store
 * Manages product data and filtering
 */
export const useProductStore = defineStore("product", () => {
  // State
  const products = ref([]);
  const currentProduct = ref(null);
  const searchResults = ref([]);
  const brands = ref([]);
  const brandsLoading = ref(false);
  const filterOptions = ref({
    categories: [],
    sellers: [],
    brands: [],
    attributes: [],
    filterAttributes: [],
    colors: [],
    priceRange: {
      min: null,
      max: null,
    },
  });
  const filterOptionsLoading = ref(false);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    total: 0,
  });

  // Getters
  const allProducts = computed(() => products.value);

  const getProductById = computed(() => {
    return (id) => products.value.find((product) => product.id === id);
  });

  function normalizeSingleProduct(payload, id = null) {
    if (!payload) {
      return null;
    }

    if (payload?.data && !Array.isArray(payload.data) && payload.data.id) {
      return payload.data;
    }

    if (Array.isArray(payload?.data)) {
      const list = payload.data;
      if (id !== null && id !== undefined) {
        const byId = list.find((item) => Number(item?.id) === Number(id));
        if (byId) {
          return byId;
        }
      }
      return list[0] || null;
    }

    if (Array.isArray(payload)) {
      if (id !== null && id !== undefined) {
        const byId = payload.find((item) => Number(item?.id) === Number(id));
        if (byId) {
          return byId;
        }
      }
      return payload[0] || null;
    }

    if (payload.id) {
      return payload;
    }

    return null;
  }

  function applyPaginationState(data) {
    if (data?.pagination) {
      pagination.value = {
        ...pagination.value,
        ...data.pagination,
      };
      return;
    }

    if (!data?.meta) {
      return;
    }

    pagination.value = {
      ...pagination.value,
      currentPage: data.meta.current_page,
      totalPages: data.meta.last_page,
      pageSize: data.meta.per_page,
      total: data.meta.total,
    };
  }

  function normalizeOptionList(source) {
    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const id = item.id ?? item.value ?? item.code ?? null;
        const name = item.name ?? item.label ?? item.value ?? item.code ?? "";
        if (id === null || id === undefined || !String(name).trim()) {
          return null;
        }

        return {
          ...item,
          id,
          name: String(name).trim(),
        };
      })
      .filter(Boolean);
  }

  function normalizeAttributes(source) {
    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((attribute) => {
        if (!attribute || typeof attribute !== "object") {
          return null;
        }

        const id = attribute.id ?? attribute.code ?? null;
        const name =
          attribute.name ?? attribute.label ?? attribute.translation ?? "";
        if (id === null || id === undefined || !String(name).trim()) {
          return null;
        }

        const valuesSource = Array.isArray(attribute.values)
          ? attribute.values
          : Array.isArray(attribute.attribute_values)
            ? attribute.attribute_values
            : [];

        const values = valuesSource
          .map((value) => {
            if (value && typeof value === "object") {
              const rawValue = value.value ?? value.id ?? value.code ?? null;
              const rawLabel =
                value.name ?? value.label ?? value.value ?? value.translation;
              if (
                rawValue === null ||
                rawValue === undefined ||
                !String(rawLabel || "").trim()
              ) {
                return null;
              }
              return {
                value: String(rawValue),
                label: String(rawLabel).trim(),
              };
            }

            if (value === null || value === undefined) {
              return null;
            }

            const normalizedValue = String(value).trim();
            if (!normalizedValue) {
              return null;
            }

            return {
              value: normalizedValue,
              label: normalizedValue,
            };
          })
          .filter(Boolean);

        return {
          id,
          name: String(name).trim(),
          values,
        };
      })
      .filter(Boolean);
  }

  function normalizePriceRange(payload) {
    const range = payload?.priceRange || payload?.price_range || {};
    const min = Number(range?.min ?? range?.from ?? range?.min_price);
    const max = Number(range?.max ?? range?.to ?? range?.max_price);

    return {
      min: Number.isFinite(min) ? min : null,
      max: Number.isFinite(max) ? max : null,
    };
  }

  function normalizeFilterOptions(payload) {
    const source =
      payload?.data &&
      !Array.isArray(payload.data) &&
      typeof payload.data === "object"
        ? payload.data
        : payload && typeof payload === "object" && !Array.isArray(payload)
          ? payload
          : {};

    return {
      categories: normalizeOptionList(source.categories),
      sellers: normalizeOptionList(source.sellers),
      brands: normalizeOptionList(source.brands),
      attributes: normalizeAttributes(source.attributes),
      filterAttributes: normalizeOptionList(
        source.filterAttributes || source.filter_attributes,
      ),
      colors: normalizeOptionList(source.colors).map((color) => ({
        ...color,
        code: String(color.code ?? color.value ?? "").trim(),
      })),
      priceRange: normalizePriceRange(source),
    };
  }

  // Actions
  /**
   * Fetch all products with pagination
   * @param {object} params - Query parameters
   */
  async function fetchProducts(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const data = await productAPI.getAll({
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...params,
      });

      products.value = data.products || data.data || data;
      applyPaginationState(data);
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching products:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch a specific product by ID
   * @param {number|string} id - Product ID
   */
  async function fetchProductById(id) {
    loading.value = true;
    error.value = null;
    currentProduct.value = null;

    try {
      const data = await productAPI.getById(id);
      const normalized = normalizeSingleProduct(data, id);
      if (!normalized) {
        throw new Error("Product not found");
      }
      currentProduct.value = normalized;

      // Update the product in the list if it exists
      const index = products.value.findIndex(
        (p) => Number(p.id) === Number(normalized.id),
      );
      if (index !== -1) {
        products.value[index] = normalized;
      } else {
        products.value.push(normalized);
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching product:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch products by category ID (including child categories)
   * @param {number|string} categoryId - Category ID
   * @param {object} params - Query parameters
   */
  async function fetchProductsByCategory(categoryId, params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const data = await productAPI.getByCategory(categoryId, {
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...params,
      });

      products.value = data.products || data.data || data;
      applyPaginationState(data);
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching products by category:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Search products by query string or params object
   * @param {string|object} queryOrParams - Search query or full query params object
   * @param {object} params - Additional query parameters
   */
  async function searchProducts(queryOrParams = "", params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const baseParams =
        typeof queryOrParams === "string"
          ? {
              ...(queryOrParams.trim() ? { name: queryOrParams.trim() } : {}),
            }
          : queryOrParams && typeof queryOrParams === "object"
            ? queryOrParams
            : {};

      const data = await productAPI.search({
        page: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...baseParams,
        ...params,
      });

      searchResults.value = data.products || data.data || data;
      products.value = searchResults.value;
      applyPaginationState(data);

      return searchResults.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error searching products:", err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchBrands(force = false) {
    if (!force && brands.value.length > 0) {
      return brands.value;
    }

    brandsLoading.value = true;
    try {
      const data = await productAPI.getBrands();
      brands.value = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      if (filterOptions.value.brands.length === 0 && brands.value.length > 0) {
        filterOptions.value = {
          ...filterOptions.value,
          brands: [...brands.value],
        };
      }

      return brands.value;
    } catch (err) {
      console.error("Error fetching brands:", err);
      return [];
    } finally {
      brandsLoading.value = false;
    }
  }

  async function fetchFilterOptions(params = {}) {
    filterOptionsLoading.value = true;

    try {
      const data = await productAPI.getFilters(params);
      filterOptions.value = normalizeFilterOptions(data);

      if (
        Array.isArray(filterOptions.value.brands) &&
        filterOptions.value.brands.length > 0
      ) {
        brands.value = filterOptions.value.brands;
      }

      return filterOptions.value;
    } catch (err) {
      console.error("Error fetching filter options:", err);

      // Keep existing brand list as fallback for filters sidebar.
      if (brands.value.length > 0 && filterOptions.value.brands.length === 0) {
        filterOptions.value = {
          ...filterOptions.value,
          brands: [...brands.value],
        };
      }

      return filterOptions.value;
    } finally {
      filterOptionsLoading.value = false;
    }
  }

  /**
   * Set current page
   * @param {number} page - Page number
   */
  function setPage(page) {
    pagination.value.currentPage = page;
  }

  /**
   * Reset pagination
   */
  function resetPagination() {
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      total: 0,
    };
  }

  return {
    // State
    products,
    currentProduct,
    searchResults,
    brands,
    brandsLoading,
    filterOptions,
    filterOptionsLoading,
    loading,
    error,
    pagination,

    // Getters
    allProducts,
    getProductById,

    // Actions
    fetchProducts,
    fetchProductById,
    fetchProductsByCategory,
    searchProducts,
    fetchBrands,
    fetchFilterOptions,
    setPage,
    resetPagination,
  };
});
