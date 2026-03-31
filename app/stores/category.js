import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { categoryAPI } from "@/services/api";

/**
 * Category Store
 * Manages category data and hierarchy
 */
export const useCategoryStore = defineStore("category", () => {
  // State
  const categories = ref([]);
  const categoryTree = ref([]);
  const currentCategory = ref(null);
  const subCategoriesById = ref({});
  const subCategoryLoading = ref({});
  const allCategoriesLoaded = ref(false);
  const loading = ref(false);
  const error = ref(null);

  function normalizeCategoryNode(node, parentId = null) {
    if (!node || !node.id) {
      return null;
    }
    const rawChildren = Array.isArray(node.children) ? node.children : [];
    const normalized = {
      ...node,
      parent_id:
        node.parent_id !== undefined && node.parent_id !== null
          ? node.parent_id
          : parentId,
      children: [],
    };

    normalized.children = rawChildren
      .map((child) => normalizeCategoryNode(child, normalized.id))
      .filter(Boolean);

    return normalized;
  }

  function flattenCategoryTree(tree) {
    const flat = [];
    const stack = [...tree];

    while (stack.length) {
      const node = stack.shift();
      if (!node || !node.id) {
        continue;
      }
      flat.push(node);
      if (Array.isArray(node.children) && node.children.length) {
        stack.unshift(...node.children);
      }
    }

    return flat;
  }

  function buildSubCategoriesLookup(tree) {
    const lookup = {};
    const stack = [...tree];

    while (stack.length) {
      const node = stack.shift();
      if (!node || !node.id) {
        continue;
      }
      const children = Array.isArray(node.children)
        ? node.children.filter((child) => child && child.id)
        : [];
      lookup[node.id] = children;
      if (children.length) {
        stack.unshift(...children);
      }
    }

    return lookup;
  }

  // Getters
  const allCategories = computed(() => categories.value);

  const getCategoryById = computed(() => {
    return (id) => categories.value.find((cat) => cat.id === id);
  });

  const rootCategories = computed(() => categoryTree.value);

  const getChildCategories = computed(() => {
    return (parentId) =>
      categories.value.filter((cat) => cat.parent_id === parentId);
  });

  // Actions
  /**
   * Fetch all categories
   */
  async function fetchCategories() {
    loading.value = true;
    error.value = null;

    try {
      const data = await categoryAPI.getAll();
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      const normalizedTree = list
        .map((item) => normalizeCategoryNode(item, null))
        .filter(Boolean);

      categoryTree.value = normalizedTree;
      categories.value = flattenCategoryTree(normalizedTree);
      subCategoriesById.value = buildSubCategoriesLookup(normalizedTree);
      allCategoriesLoaded.value = true;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching categories:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch sub-categories for a parent category
   * @param {number|string} parentId - Parent category ID
   */
  async function fetchSubCategories(parentId) {
    const id = Number(parentId);
    if (!id) {
      return [];
    }
    if (subCategoriesById.value[id]) {
      return subCategoriesById.value[id];
    }

    const fromTree = categories.value.find((item) => item.id === id)?.children;
    if (Array.isArray(fromTree) && fromTree.length > 0) {
      subCategoriesById.value = {
        ...subCategoriesById.value,
        [id]: fromTree,
      };
      return fromTree;
    }

    if (allCategoriesLoaded.value) {
      return [];
    }

    subCategoryLoading.value = {
      ...subCategoryLoading.value,
      [id]: true,
    };
    error.value = null;

    try {
      const data = await categoryAPI.getSubCategories(id);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.categories)
          ? data.data.categories
          : Array.isArray(data)
            ? data
            : [];

      const normalized = list
        .filter((item) => item && item.id)
        .map((item) => ({
          ...item,
          parent_id:
            item.parent_id !== undefined && item.parent_id !== null
              ? item.parent_id
              : id,
        }));

      subCategoriesById.value = {
        ...subCategoriesById.value,
        [id]: normalized,
      };

      const existingById = new Map(
        categories.value
          .filter((item) => item && item.id)
          .map((item) => [item.id, item]),
      );
      normalized.forEach((item) => {
        existingById.set(item.id, item);
      });
      categories.value = Array.from(existingById.values());
      allCategoriesLoaded.value = false;

      return normalized;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching sub-categories:", err);
      return [];
    } finally {
      subCategoryLoading.value = {
        ...subCategoryLoading.value,
        [id]: false,
      };
    }
  }

  function getChildrenCount(category) {
    const rawCount =
      category?.number_of_children ??
      category?.children_count ??
      category?.total_children ??
      0;
    return Number(rawCount) || 0;
  }

  /**
   * Recursively load all category levels once, then reuse cached data for search/UI.
   */
  async function ensureAllCategoriesLoaded() {
    if (allCategoriesLoaded.value) {
      return;
    }

    if (!categoryTree.value.length) {
      await fetchCategories();
    }
    if (allCategoriesLoaded.value) {
      return;
    }
    // Backward-compatible fallback when backend does not yet return nested children.
    const queue = categories.value
      .filter((item) => item && item.id)
      .map((item) => item.id);
    const visited = new Set();

    while (queue.length > 0) {
      const parentId = queue.shift();
      if (!parentId || visited.has(parentId)) {
        continue;
      }
      visited.add(parentId);

      const parent = categories.value.find((item) => item.id === parentId);
      if (!parent || getChildrenCount(parent) <= 0) {
        continue;
      }

      const children = await fetchSubCategories(parentId);
      children.forEach((child) => {
        if (!visited.has(child.id)) {
          queue.push(child.id);
        }
      });
    }

    allCategoriesLoaded.value = true;
  }

  /**
   * Fetch a specific category by ID
   * @param {number|string} id - Category ID
   */
  async function fetchCategoryById(id) {
    loading.value = true;
    error.value = null;

    try {
      if (!categories.value.length) {
        await fetchCategories();
      }

      const data = categories.value.find((cat) => cat.id === Number(id));
      if (!data) {
        throw new Error("Category not found");
      }
      currentCategory.value = data;

      // Update the category in the list if it exists
      const index = categories.value.findIndex((cat) => cat.id === id);
      if (index !== -1) {
        categories.value[index] = data;
      } else {
        categories.value.push(data);
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching category:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Search categories by name
   * @param {string} query - Search query
   */
  async function searchCategories(query) {
    loading.value = true;
    error.value = null;

    try {
      return await categoryAPI.search(query);
    } catch (err) {
      error.value = err.message;
      console.error("Error searching categories:", err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get all descendant category IDs (recursively)
   * @param {number|string} categoryId - Category ID
   * @returns {Array<number>} Array of category IDs
   */
  function getDescendantIds(categoryId) {
    const descendants = [];
    const children = getChildCategories.value(categoryId);

    children.forEach((child) => {
      descendants.push(child.id);
      descendants.push(...getDescendantIds(child.id));
    });

    return descendants;
  }

  return {
    // State
    categories,
    categoryTree,
    currentCategory,
    subCategoriesById,
    subCategoryLoading,
    allCategoriesLoaded,
    loading,
    error,

    // Getters
    allCategories,
    getCategoryById,
    rootCategories,
    getChildCategories,

    // Actions
    fetchCategories,
    fetchCategoryById,
    fetchSubCategories,
    ensureAllCategoriesLoaded,
    searchCategories,
    getDescendantIds,
  };
});
