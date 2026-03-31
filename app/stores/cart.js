import { ref, computed, onMounted } from "vue";
import { defineStore } from "pinia";

const CART_STORAGE_KEY = "b2b_cart";
const MAX_ITEM_QUANTITY = 999;
const SAVE_DEBOUNCE_MS = 120;

function normalizeProductId(productId) {
  if (productId === null || productId === undefined) {
    return "";
  }
  return String(productId);
}

function clampQuantity(quantity) {
  const parsed = Number.parseInt(String(quantity), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, MAX_ITEM_QUANTITY);
}

function normalizeLocale(locale) {
  return String(locale || "").toLowerCase().startsWith("en") ? "en" : "ar";
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

/**
 * Cart Store
 * Manages cart items for price list requests
 */
export const useCartStore = defineStore("cart", () => {
  // State
  const items = ref([]);
  const persistTimer = ref(null);
  const customerInfo = ref({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  // Getters
  const cartItems = computed(() => items.value);

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const uniqueProductCount = computed(() => items.value.length);

  const itemIndexByProductId = computed(() => {
    const index = new Map();

    items.value.forEach((item, idx) => {
      const normalizedId = normalizeProductId(item?.product?.id);
      if (normalizedId) {
        index.set(normalizedId, idx);
      }
    });

    return index;
  });

  function getCartItem(productId) {
    const index = itemIndexByProductId.value.get(normalizeProductId(productId));

    if (index === undefined) {
      return null;
    }

    return items.value[index] || null;
  }

  const getItemByProductId = computed(() => {
    return (productId) => getCartItem(productId);
  });

  const isProductInCart = computed(() => {
    return (productId) => {
      return itemIndexByProductId.value.has(normalizeProductId(productId));
    };
  });

  function scheduleSaveCart() {
    if (import.meta.server) {
      return;
    }

    if (persistTimer.value) {
      clearTimeout(persistTimer.value);
    }

    persistTimer.value = setTimeout(() => {
      persistTimer.value = null;
      saveCart();
    }, SAVE_DEBOUNCE_MS);
  }

  // Actions
  /**
   * Add product to cart
   * @param {object} product - Product object
   * @param {number} quantity - Quantity to add
   */
  function addToCart(product, quantity = 1) {
    const normalizedId = normalizeProductId(product?.id);
    if (!normalizedId || !product || typeof product !== "object") {
      return;
    }

    const safeQuantity = clampQuantity(quantity);
    const existingItem = getCartItem(normalizedId);

    if (existingItem) {
      existingItem.quantity = clampQuantity(existingItem.quantity + safeQuantity);
    } else {
      items.value.push({
        product,
        quantity: safeQuantity,
        addedAt: new Date().toISOString(),
      });
    }

    scheduleSaveCart();
  }

  /**
   * Remove product from cart
   * @param {number|string} productId - Product ID
   */
  function removeFromCart(productId) {
    const normalizedId = normalizeProductId(productId);
    const index = itemIndexByProductId.value.get(normalizedId);

    if (index !== undefined) {
      items.value.splice(index, 1);
      scheduleSaveCart();
    }
  }

  /**
   * Update product quantity in cart
   * @param {number|string} productId - Product ID
   * @param {number} quantity - New quantity
   */
  function updateQuantity(productId, quantity) {
    const item = getCartItem(productId);
    const safeQuantity = clampQuantity(quantity);

    if (item) {
      if (Number(quantity) <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = safeQuantity;
        scheduleSaveCart();
      }
    }
  }

  /**
   * Increment product quantity
   * @param {number|string} productId - Product ID
   */
  function incrementQuantity(productId) {
    const item = getCartItem(productId);

    if (item) {
      item.quantity = clampQuantity(item.quantity + 1);
      scheduleSaveCart();
    }
  }

  /**
   * Decrement product quantity
   * @param {number|string} productId - Product ID
   */
  function decrementQuantity(productId) {
    const item = getCartItem(productId);

    if (item) {
      if (item.quantity > 1) {
        item.quantity = clampQuantity(item.quantity - 1);
        scheduleSaveCart();
      } else {
        removeFromCart(productId);
      }
    }
  }

  /**
   * Clear all items from cart
   */
  function clearCart() {
    if (persistTimer.value) {
      clearTimeout(persistTimer.value);
      persistTimer.value = null;
    }

    items.value = [];
    saveCart();
  }

  /**
   * Update customer information
   * @param {object} info - Customer information
   */
  function updateCustomerInfo(info) {
    customerInfo.value = {
      ...customerInfo.value,
      ...info,
    };
    scheduleSaveCart();
  }

  /**
   * Save cart to localStorage
   */
  function saveCart() {
    if (import.meta.server) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: items.value,
          customerInfo: customerInfo.value,
        }),
      );
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }

  function normalizeLoadedItems(savedItems) {
    if (!Array.isArray(savedItems)) {
      return [];
    }

    const merged = new Map();

    savedItems.forEach((rawItem) => {
      const product = rawItem?.product;
      const normalizedId = normalizeProductId(product?.id);
      if (!normalizedId || !product || typeof product !== "object") {
        return;
      }

      const existing = merged.get(normalizedId);
      const safeQuantity = clampQuantity(rawItem?.quantity);

      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + safeQuantity);
        return;
      }

      merged.set(normalizedId, {
        product,
        quantity: safeQuantity,
        addedAt: rawItem?.addedAt || new Date().toISOString(),
      });
    });

    return Array.from(merged.values());
  }

  function getLocalizedProductName(product, locale = "ar") {
    if (!product || typeof product !== "object") {
      return "";
    }

    const safeLocale = normalizeLocale(locale);
    const translations =
      product.translations && typeof product.translations === "object"
        ? product.translations
        : {};
    const translationName =
      translations?.[safeLocale]?.name ||
      translations?.[safeLocale]?.title ||
      null;

    if (safeLocale === "ar") {
      return firstNonEmpty(
        product.name_ar,
        product.ar_name,
        product.arabic_name,
        product.nameAr,
        product.title_ar,
        translationName,
        product.name,
      );
    }

    return firstNonEmpty(
      product.name_en,
      product.en_name,
      product.english_name,
      product.nameEn,
      product.title_en,
      translationName,
      product.name,
    );
  }

  /**
   * Load cart from localStorage
   */
  function loadCart() {
    if (import.meta.server) {
      return;
    }

    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const { items: savedItems, customerInfo: savedCustomerInfo } =
          JSON.parse(savedCart);

        items.value = normalizeLoadedItems(savedItems);
        customerInfo.value = savedCustomerInfo || customerInfo.value;
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }

  /**
   * Prepare price list request data
   * @returns {object} Request data
   */
  function preparePriceListRequest(locale = "ar") {
    return {
      customer: customerInfo.value,
      items: items.value.map((item) => ({
        product_id: Number(item.product.id),
        product_name: getLocalizedProductName(item.product, locale),
        product_sku: item.product.sku,
        quantity: item.quantity,
      })),
      created_at: new Date().toISOString(),
    };
  }

  // Initialize cart from localStorage only after client-side hydration.
  // Avoids SSR/client hydration mismatch since localStorage is unavailable on server.
  if (import.meta.client) {
    onMounted(() => {
      loadCart();
    });
  }

  return {
    // State
    items,
    customerInfo,

    // Getters
    cartItems,
    itemCount,
    uniqueProductCount,
    getItemByProductId,
    isProductInCart,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    updateCustomerInfo,
    saveCart,
    loadCart,
    getLocalizedProductName,
    preparePriceListRequest,
  };
});
