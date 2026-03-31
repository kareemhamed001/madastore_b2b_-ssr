import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { orderAPI } from "@/services/api";

function normalizeStatus(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (
    ["pending", "new", "created", "processing", "in_progress"].includes(
      normalized,
    )
  ) {
    return "pending";
  }

  if (
    [
      "قيد المراجعة",
      "قيد الانتظار",
      "قيد المعالجة",
      "قيد التنفيذ",
      "قيد التجهيز",
      "جاري التجهيز",
      "بانتظار الدفع",
    ].includes(normalized)
  ) {
    return "pending";
  }

  if (
    ["confirmed", "approved", "completed", "delivered", "success"].includes(
      normalized,
    )
  ) {
    return "completed";
  }

  if (
    [
      "تم التسليم",
      "تم التوصيل",
      "مكتمل",
      "مكتملة",
      "تم التنفيذ",
      "ناجحة",
      "ناجح",
      "مؤكد",
    ].includes(normalized)
  ) {
    return "completed";
  }

  if (["rejected", "cancelled", "canceled", "failed"].includes(normalized)) {
    return "rejected";
  }

  if (
    [
      "تم الالغاء",
      "تم الإلغاء",
      "ملغي",
      "ملغاة",
      "مرفوض",
      "مرفوضة",
      "فشل",
      "فاشل",
    ].includes(normalized)
  ) {
    return "rejected";
  }

  return normalized;
}

function parseAmount(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const asString = String(value).trim();
  if (!asString) {
    return null;
  }

  const normalized = asString.replace(/,/g, "");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : null;
}

function normalizeOrder(order) {
  if (!order || typeof order !== "object") {
    return null;
  }

  const id =
    order.id ?? order.order_id ?? order.purchase_id ?? order.reference ?? null;

  if (id === null || id === undefined || id === "") {
    return null;
  }

  return {
    ...order,
    id,
    status: normalizeStatus(
      order.status || order.delivery_status || order.delivery_status_string,
    ),
    createdAt: order.createdAt || order.created_at || order.date || null,
    total:
      order.total ??
      order.total_amount ??
      order.amount ??
      order.grand_total ??
      null,
    totalAmount: parseAmount(
      order.total ??
        order.total_amount ??
        order.amount ??
        order.grand_total ??
        order.remaining,
    ),
    itemsCount:
      Number(order.items_count ?? order.orders_count ?? order.itemsCount) || 0,
    items:
      order.items || order.products || order.lines || order.order_items || [],
  };
}

function extractOrders(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.orders,
    payload?.purchase_history,
    payload?.history,
    payload?.results,
    payload?.data?.orders,
    payload?.data?.purchase_history,
    payload?.data?.history,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate));
  if (!firstArray) {
    return [];
  }

  return firstArray.map((order) => normalizeOrder(order)).filter(Boolean);
}

function extractSingleOrder(payload) {
  const candidates = [
    payload?.data?.data,
    payload?.data,
    payload?.order,
    payload?.purchase,
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      const normalized = normalizeOrder(candidate[0]);
      if (normalized) {
        return normalized;
      }
      continue;
    }

    const normalized = normalizeOrder(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function looksLikeOrderObject(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }

  const hasId =
    candidate.id !== undefined ||
    candidate.order_id !== undefined ||
    candidate.purchase_id !== undefined ||
    candidate.reference !== undefined;

  if (!hasId) {
    return false;
  }

  const orderHints = [
    "store_code",
    "payment_type",
    "delivery_status",
    "delivery_status_string",
    "grand_total",
    "subtotal",
    "shipping_address",
    "date",
    "remaining",
  ];

  return orderHints.some((key) => key in candidate);
}

function findOrderRecursively(payload, maxDepth = 6) {
  const queue = [{ value: payload, depth: 0 }];
  const visited = new Set();
  let firstIdObject = null;

  while (queue.length > 0) {
    const { value, depth } = queue.shift();

    if (!value || typeof value !== "object") {
      continue;
    }

    if (visited.has(value)) {
      continue;
    }
    visited.add(value);

    if (!Array.isArray(value)) {
      if (looksLikeOrderObject(value)) {
        return value;
      }

      if (
        !firstIdObject &&
        (value.id !== undefined ||
          value.order_id !== undefined ||
          value.purchase_id !== undefined ||
          value.reference !== undefined)
      ) {
        firstIdObject = value;
      }
    }

    if (depth >= maxDepth) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry && typeof entry === "object") {
          queue.push({ value: entry, depth: depth + 1 });
        }
      });
      continue;
    }

    Object.values(value).forEach((entry) => {
      if (entry && typeof entry === "object") {
        queue.push({ value: entry, depth: depth + 1 });
      }
    });
  }

  return firstIdObject;
}

function normalizeOrderItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const id = item.id ?? item.product_id ?? item.sku ?? `${Math.random()}`;
  const quantity = Number(item.quantity ?? item.qty ?? 1);

  return {
    ...item,
    id,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    name:
      item.product_name ??
      item.name ??
      item.product?.name ??
      item.product?.title ??
      "-",
    price:
      item.price ??
      item.unit_price ??
      item.sale_price ??
      item.product?.price ??
      null,
    image:
      item.image ??
      item.thumbnail ??
      item.product?.thumbnail ??
      item.product?.image ??
      null,
  };
}

function extractOrderItems(payload) {
  const candidates = [
    payload?.data?.data,
    payload?.data,
    payload?.items,
    payload?.order_items,
    payload,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate));
  if (!firstArray) {
    return [];
  }

  return firstArray.map((item) => normalizeOrderItem(item)).filter(Boolean);
}

export const usePurchaseHistoryStore = defineStore("purchaseHistory", () => {
  const orders = ref([]);
  const currentOrder = ref(null);
  const currentOrderItems = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const initialized = ref(false);

  const allOrders = computed(() => orders.value);

  const hasOrders = computed(() => orders.value.length > 0);

  const pendingOrders = computed(() => {
    return orders.value.filter((order) => order.status === "pending");
  });

  const completedOrders = computed(() => {
    return orders.value.filter((order) => order.status === "completed");
  });

  const rejectedOrders = computed(() => {
    return orders.value.filter((order) => order.status === "rejected");
  });

  const totalOrders = computed(() => orders.value.length);

  const getOrderById = computed(() => {
    return (id) => {
      return (
        orders.value.find((order) => String(order.id) === String(id)) || null
      );
    };
  });

  async function fetchOrders({ force = false } = {}) {
    if (loading.value) {
      return orders.value;
    }

    if (initialized.value && !force) {
      return orders.value;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await orderAPI.getAll();
      orders.value = extractOrders(response);
      initialized.value = true;
      return orders.value;
    } catch (fetchError) {
      error.value = fetchError?.message || "Failed to load orders";
      console.error("Error fetching purchase history:", fetchError);
      throw fetchError;
    } finally {
      loading.value = false;
    }
  }

  async function refreshOrders() {
    return fetchOrders({ force: true });
  }

  async function fetchOrderById(id) {
    error.value = null;
    currentOrderItems.value = [];
    currentOrder.value = getOrderById.value(id);

    if (currentOrder.value) {
      return currentOrder.value;
    }

    loading.value = true;

    try {
      const response = await orderAPI.getById(id);
      const orderFromCandidates = extractSingleOrder(response);
      const orderFromTraversal = findOrderRecursively(response);
      const order = normalizeOrder(orderFromCandidates || orderFromTraversal);

      if (!order) {
        await fetchOrders({ force: true });
        const orderFromList = getOrderById.value(id);

        if (!orderFromList) {
          throw new Error("Order not found");
        }

        currentOrder.value = orderFromList;
        return currentOrder.value;
      }

      currentOrder.value = order;

      const existingIndex = orders.value.findIndex(
        (item) => String(item.id) === String(order.id),
      );

      if (existingIndex >= 0) {
        orders.value[existingIndex] = order;
      } else {
        orders.value.unshift(order);
      }

      return currentOrder.value;
    } catch (fetchError) {
      error.value = fetchError?.message || "Failed to load order details";
      currentOrder.value = null;
      throw fetchError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrderItems(id) {
    error.value = null;

    try {
      const response = await orderAPI.getItems(id);
      currentOrderItems.value = extractOrderItems(response);
      return currentOrderItems.value;
    } catch (fetchError) {
      error.value = fetchError?.message || "Failed to load order items";
      currentOrderItems.value = [];
      throw fetchError;
    }
  }

  function clearHistory() {
    orders.value = [];
    currentOrder.value = null;
    currentOrderItems.value = [];
    initialized.value = false;
    error.value = null;
  }

  return {
    orders,
    currentOrder,
    currentOrderItems,
    loading,
    error,
    initialized,
    allOrders,
    hasOrders,
    pendingOrders,
    completedOrders,
    rejectedOrders,
    totalOrders,
    getOrderById,
    fetchOrders,
    refreshOrders,
    fetchOrderById,
    fetchOrderItems,
    clearHistory,
  };
});
