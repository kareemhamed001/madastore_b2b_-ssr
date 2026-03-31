<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
    <div v-if="!auth.isAuthenticated"
      class="rounded-2xl border border-[var(--mada-border)] bg-white px-6 py-10 text-center shadow-sm md:px-10">
      <h1 class="text-2xl font-bold text-[var(--mada-dark)] md:text-3xl">{{ t("nav.priceRequests") }}</h1>
      <p class="mt-3 text-sm text-[var(--mada-muted)] md:text-base">
        {{ t("priceRequest.loginRequired") }}
      </p>
      <NuxtLink to="/login"
        class="mt-6 inline-flex rounded-xl bg-[var(--mada-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t("priceRequest.goToLogin") }}
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <header class="overflow-hidden rounded-3xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:p-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p
              class="inline-flex rounded-full border border-[#cfe9ff] bg-[#f2f9ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--mada-primary)]">
              {{ t("nav.priceRequests") }}
            </p>
            <h1 class="mt-3 text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">{{ t("priceRequest.listTitle") }}
            </h1>
            <p class="mt-2 text-sm text-[var(--mada-muted)] md:text-base">
              {{ t("priceRequest.listSubtitle") }}
            </p>
          </div>

          <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <button @click="handleRefresh" :disabled="priceListRequestStore.loading"
              class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] disabled:cursor-not-allowed disabled:opacity-60">
              {{ priceListRequestStore.loading ? t("priceRequest.refreshing") : t("priceRequest.refresh") }}
            </button>
            <NuxtLink to="/price-list-requests/create"
              class="rounded-xl bg-[var(--mada-primary)] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
              {{ t("priceRequest.createNew") }}
            </NuxtLink>
          </div>
        </div>
      </header>

      <div v-if="feedbackMessage" role="status" :class="feedbackClass" class="rounded-xl border px-4 py-3 text-sm">
        {{ feedbackMessage }}
      </div>

      <div v-if="priceListRequestStore.error" role="alert"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ priceListRequestStore.error }}
      </div>

      <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article class="rounded-2xl border border-[var(--mada-border)] bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
            t("priceRequest.totalRequests") }}</p>
          <p class="mt-2 text-2xl font-bold text-[var(--mada-dark)]">{{ requestStats.total }}</p>
        </article>
        <article class="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-yellow-700">{{
            t("priceRequest.statusPending") }}</p>
          <p class="mt-2 text-2xl font-bold text-yellow-800">{{ requestStats.pending }}</p>
        </article>
        <article class="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-green-700">{{
            t("priceRequest.statusConfirmed") }}</p>
          <p class="mt-2 text-2xl font-bold text-green-800">{{ requestStats.confirmed }}</p>
        </article>
        <article class="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-red-700">{{ t("priceRequest.statusRejected")
          }}</p>
          <p class="mt-2 text-2xl font-bold text-red-800">{{ requestStats.rejected }}</p>
        </article>
      </section>

      <section class="rounded-2xl border border-[var(--mada-border)] bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label
            class="flex items-center gap-3 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-3 py-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5 text-[var(--mada-muted)]"
              aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke-width="1.8" />
              <path d="m20 20-3-3" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <input v-model="searchQuery" type="search"
              class="w-full border-0 bg-transparent text-sm text-[var(--mada-dark)] outline-none placeholder:text-[var(--mada-muted)]"
              :placeholder="t('priceRequest.searchPlaceholder')" />
          </label>

          <button v-if="hasFilters" @click="clearFilters"
            class="rounded-lg border border-[var(--mada-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
            {{ t("priceRequest.clearFilters") }}
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
            t("priceRequest.status") }}:</p>
          <button v-for="option in statusOptions" :key="option.value" @click="activeStatusFilter = option.value"
            class="rounded-full border px-3 py-1 text-xs font-semibold transition"
            :class="activeStatusFilter === option.value
              ? 'border-[var(--mada-primary)] bg-[#edf7ff] text-[var(--mada-primary)]'
              : 'border-[var(--mada-border)] bg-white text-[var(--mada-dark)] hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]'">
            {{ t(option.labelKey) }}
          </button>
        </div>
      </section>

      <div v-if="priceListRequestStore.loading && !hasRequests"
        class="rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-10 shadow-sm">
        <div class="flex items-center justify-center gap-3 text-[var(--mada-muted)]">
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mada-border)] border-t-[var(--mada-primary)]">
          </div>
          <p class="text-sm font-medium">{{ t("common.loading") }}</p>
        </div>
      </div>

      <div v-else-if="filteredRequests.length === 0"
        class="rounded-2xl border border-[var(--mada-border)] bg-white px-6 py-10 text-center shadow-sm">
        <p class="text-lg font-semibold text-[var(--mada-dark)]">
          {{ hasRequests ? t("priceRequest.noResults") : t("priceRequest.noRequests") }}
        </p>
        <p class="mt-2 text-sm text-[var(--mada-muted)]">
          {{ hasRequests ? t("priceRequest.noResultsHint") : t("priceRequest.noRequestsHint") }}
        </p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button v-if="hasFilters" @click="clearFilters"
            class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
            {{ t("priceRequest.clearFilters") }}
          </button>
          <NuxtLink to="/price-list-requests/create"
            class="rounded-xl bg-[var(--mada-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
            {{ t("priceRequest.createNew") }}
          </NuxtLink>
        </div>
      </div>

      <section v-else class="grid grid-cols-1 gap-4">
        <article v-for="request in filteredRequests" :key="request.id"
          class="rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                {{ t("priceRequest.requestLabel") }} #{{ request.id }}
              </p>
              <p class="mt-2 text-sm text-[var(--mada-muted)]">
                {{ t("priceRequest.createdAt") }}: {{ formatDate(request.created_at || request.createdAt) }}
              </p>
            </div>

            <span :class="getStatusBadgeClass(request.status)"
              class="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold">
              {{ formatStatus(request.status) }}
            </span>
          </div>

          <div class="mt-4 border-t border-[var(--mada-border)] pt-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
              {{ t("priceRequest.products") }} ({{ request.products?.length || 0 }})
            </p>
            <div v-if="request.products?.length" class="mt-3 flex flex-wrap gap-2">
              <div v-for="(product, idx) in request.products" :key="`${request.id}-${idx}`"
                class="rounded-full border border-[var(--mada-border)] bg-[var(--mada-soft)] px-3 py-1 text-xs font-medium text-[var(--mada-dark)]">
                <NuxtLink v-if="getProductRoute(product)" :to="getProductRoute(product)"
                  class="transition hover:text-[var(--mada-primary)] hover:underline">
                  {{ getProductLabel(product) }}
                </NuxtLink>
                <span v-else>{{ getProductLabel(product) }}</span>
              </div>
            </div>
            <p v-else class="mt-3 text-sm text-[var(--mada-muted)]">{{ t("cart.empty") }}</p>

            <p v-if="request.notes"
              class="mt-4 rounded-xl bg-[var(--mada-soft)] px-3 py-2 text-sm text-[var(--mada-muted)]">
              <span class="font-semibold text-[var(--mada-dark)]">{{ t("priceRequest.additionalNotes") }}:</span>
              {{ request.notes }}
            </p>
          </div>

          <div class="mt-4 flex flex-col gap-2 border-t border-[var(--mada-border)] pt-4 sm:flex-row">
            <NuxtLink :to="`/price-list-requests/${request.id}`"
              class="inline-flex flex-1 items-center justify-center rounded-lg border border-[var(--mada-border)] bg-[var(--mada-soft)] px-4 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
              {{ t("common.view") }}
            </NuxtLink>

            <button @click="deleteRequest(request.id)" :disabled="deletingId === request.id"
              class="inline-flex flex-1 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
              {{ deletingId === request.id ? t("common.loading") : t("priceRequest.deleteAction") }}
            </button>
          </div>
        </article>
      </section>

      <div v-if="priceListRequestStore.loading && hasRequests"
        class="flex items-center justify-center gap-2 py-2 text-sm text-[var(--mada-muted)]">
        <div
          class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--mada-border)] border-t-[var(--mada-primary)]">
        </div>
        <p>{{ t("priceRequest.refreshing") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/stores/locale";
import { usePriceListRequestStore } from "@/stores/priceListRequest";

definePageMeta({
  requiresAuth: true,
});

const auth = useAuthStore();
const localeStore = useLocaleStore();
const priceListRequestStore = usePriceListRequestStore();
const t = localeStore.t;

const activeStatusFilter = ref("all");
const searchQuery = ref("");
const deletingId = ref(null);
const feedbackMessage = ref("");
const feedbackType = ref("success");
let feedbackTimeout = null;

const statusOptions = [
  { value: "all", labelKey: "priceRequest.filterAll" },
  { value: "pending", labelKey: "priceRequest.statusPending" },
  { value: "confirmed", labelKey: "priceRequest.statusConfirmed" },
  { value: "rejected", labelKey: "priceRequest.statusRejected" },
];

const hasRequests = computed(() => priceListRequestStore.allRequests.length > 0);
const hasFilters = computed(() => activeStatusFilter.value !== "all" || searchQuery.value.trim().length > 0);

const requestStats = computed(() => ({
  total: priceListRequestStore.allRequests.length,
  pending: priceListRequestStore.pendingRequests.length,
  confirmed: priceListRequestStore.confirmedRequests.length,
  rejected: priceListRequestStore.rejectedRequests.length,
}));

const feedbackClass = computed(() => {
  if (feedbackType.value === "error") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
});

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return [...priceListRequestStore.allRequests]
    .filter((request) => {
      if (activeStatusFilter.value !== "all" && request.status !== activeStatusFilter.value) {
        return false;
      }

      if (!query) {
        return true;
      }

      const productsText = Array.isArray(request.products)
        ? request.products.map((product) => getProductLabel(product).toLowerCase()).join(" ")
        : "";
      const notesText = String(request.notes || "").toLowerCase();
      return String(request.id).includes(query) || productsText.includes(query) || notesText.includes(query);
    })
    .sort((first, second) => {
      const dateDiff = getRequestTimestamp(second) - getRequestTimestamp(first);
      if (dateDiff !== 0) {
        return dateDiff;
      }
      return Number(second.id || 0) - Number(first.id || 0);
    });
});

function getRequestTimestamp(request) {
  const dateValue = request?.created_at || request?.createdAt;
  const dateObj = new Date(dateValue);
  return Number.isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
}

function formatStatus(status) {
  if (!status) return t("priceRequest.statusUnknown");

  switch (String(status).toLowerCase()) {
    case "confirmed":
      return t("priceRequest.statusConfirmed");
    case "rejected":
      return t("priceRequest.statusRejected");
    case "pending":
      return t("priceRequest.statusPending");
    default:
      return t("priceRequest.statusUnknown");
  }
}

function formatDate(date) {
  if (!date) return t("priceRequest.unknownDate");
  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return t("priceRequest.invalidDate");
  return dateObj.toLocaleDateString(localeStore.locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-[var(--mada-soft)] text-[var(--mada-dark)]";
  }
}

function getProductLabel(product) {
  if (product && typeof product === "object") {
    if (product.name) {
      return String(product.name);
    }
    if (product.id) {
      return `#${product.id}`;
    }
  }
  return String(product || "");
}

function getProductRoute(product) {
  if (product && typeof product === "object" && product.id) {
    return `/product/${product.id}`;
  }
  return null;
}

function clearFilters() {
  activeStatusFilter.value = "all";
  searchQuery.value = "";
}

function showFeedback(type, message) {
  feedbackType.value = type;
  feedbackMessage.value = message;

  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
  }

  feedbackTimeout = setTimeout(() => {
    feedbackMessage.value = "";
  }, 3500);
}

async function handleRefresh() {
  try {
    await priceListRequestStore.fetchRequests();
  } catch (err) {
    console.error("Error refreshing requests:", err);
    showFeedback("error", t("priceRequest.loadFailed"));
  }
}

async function deleteRequest(id) {
  if (!confirm(t("priceRequest.confirmDelete"))) {
    return;
  }

  deletingId.value = id;
  try {
    await priceListRequestStore.deleteRequest(id);
    showFeedback("success", t("priceRequest.deletedSuccess"));
  } catch (err) {
    console.error("Error deleting request:", err);
    showFeedback("error", t("priceRequest.deletedFailed"));
  } finally {
    deletingId.value = null;
  }
}

onMounted(() => {
  handleRefresh();
});

onBeforeUnmount(() => {
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
  }
});
</script>
