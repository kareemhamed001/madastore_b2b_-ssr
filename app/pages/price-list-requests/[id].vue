<template>
  <div class="price-request-page mx-auto w-full max-w-5xl px-4 py-8 md:py-10">
    <header
      class="request-page-header mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
      <div>
        <NuxtLink to="/price-list-requests"
          class="no-print mb-3 inline-flex items-center text-sm font-medium text-[var(--mada-primary)] transition hover:underline">
          {{ t('nav.priceRequests') }}
        </NuxtLink>
        <h1 class="text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">
          {{ t('priceRequest.requestDetails') }}
          <span v-if="currentRequest" class="font-semibold">#{{ currentRequest.id }}</span>
        </h1>
        <p v-if="currentRequest" class="mt-2 text-sm text-[var(--mada-muted)]">
          {{ t('priceRequest.createdAt') }}: {{ formatDate(currentRequest.created_at || currentRequest.createdAt) }}
        </p>
      </div>
      <div class="no-print flex flex-row items-stretch gap-3">

        <button v-if="!isLoading" @click="loadRequest"
          class="w-full rounded-md bg-[var(--mada-soft)] px-5 py-2.5 text-sm font-medium text-[var(--mada-dark)] transition hover:bg-[var(--mada-border)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          :disabled="isLoading">
          {{ isLoading ? t('common.loading') : t('common.retry') }}
        </button>
        <button @click="downloadPdf"
          class="w-full rounded-md bg-[var(--mada-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--mada-border)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          :disabled="isLoading">
          {{ t('priceRequest.downloadPdf') }}
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="rounded-2xl border border-[var(--mada-border)] bg-white p-8 shadow-sm">
      <div class="flex items-center justify-center gap-3 text-[var(--mada-muted)]">
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mada-border)] border-t-[var(--mada-primary)]">
        </div>
        <span class="text-sm font-medium">{{ t('common.loading') }}</span>
      </div>
    </div>

    <div v-else-if="isNotFound"
      class="rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-8 text-center shadow-sm">
      <p class="text-base font-medium text-[var(--mada-dark)]">{{ t('priceRequest.notFound') }}</p>
      <NuxtLink to="/price-list-requests"
        class="mt-4 inline-flex rounded-md bg-[var(--mada-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t('nav.priceRequests') }}
      </NuxtLink>
    </div>

    <div v-else-if="requestError" role="alert"
      class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <p>{{ requestError }}</p>
    </div>

    <div v-else-if="currentRequest" class="request-content space-y-6">

      <section class="request-overview grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="request-card rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-[var(--mada-muted)]">{{ t('priceRequest.status')
            }}</p>
          <p class="mt-3">
            <span :class="getStatusBadgeClass(currentRequest.status)"
              class="status-badge inline-flex rounded-full px-3 py-1 text-sm font-medium">
              {{ formatStatus(currentRequest.status) }}
            </span>
          </p>
        </div>

        <div class="request-card rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-[var(--mada-muted)]">{{
            t('priceRequest.products') }}</p>
          <p class="mt-3 text-2xl font-bold text-[var(--mada-dark)]">{{ normalizedProducts.length }}</p>
        </div>

        <div class="request-card rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-[var(--mada-muted)]">{{
            t('priceRequest.createdAt') }}</p>
          <p class="mt-3 text-sm font-medium text-[var(--mada-dark)]">
            {{ formatDate(currentRequest.created_at || currentRequest.createdAt) }}
          </p>
        </div>
      </section>

      <section
        class="request-card request-products-section rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:p-6">
        <h2 class="mb-4 text-xl font-semibold text-[var(--mada-dark)]">{{ t('priceRequest.products') }}</h2>

        <div v-if="normalizedProducts.length > 0" class="overflow-x-auto">
          <table class="products-desktop-table hidden min-w-full table-auto border-collapse md:table"
            id="products-table">
            <thead>
              <tr>
                <th
                  class="border-b border-[var(--mada-border)] px-4 py-3 text-start text-sm font-semibold text-[var(--mada-muted)]">
                  {{ t('priceRequest.productName') }}
                </th>
                <th
                  class="border-b border-[var(--mada-border)] px-4 py-3 text-start text-sm font-semibold text-[var(--mada-muted)]">
                  {{ t('priceRequest.quantity') }}
                </th>
                <th
                  class="border-b border-[var(--mada-border)] px-4 py-3 text-start text-sm font-semibold text-[var(--mada-muted)]">
                  {{ t('priceRequest.price') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, idx) in normalizedProducts" :key="`${product.id || product.name}-${idx}`"
                class="border-b border-[var(--mada-border)] last:border-b-0">
                <td class="px-4 py-3 text-sm text-[var(--mada-dark)]">
                  <NuxtLink v-if="product.id" :to="`/product/${product.id}`"
                    class="font-medium text-[var(--mada-primary)] hover:underline">
                    {{ product.name }}
                  </NuxtLink>
                  <span v-else>{{ product.name }}</span>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-[var(--mada-dark)]">{{ product.quantity }}</td>
                <td class="px-4 py-3 text-sm font-medium text-[var(--mada-dark)]">{{ formatPrice(product.price) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="products-mobile-list space-y-3 md:hidden">
            <div v-for="(product, idx) in normalizedProducts" :key="`mobile-${product.id || product.name}-${idx}`"
              class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-[var(--mada-muted)]">{{
                t('priceRequest.productName') }}</p>
              <NuxtLink v-if="product.id" :to="`/product/${product.id}`"
                class="mt-1 block text-sm font-medium text-[var(--mada-primary)] hover:underline">
                {{ product.name }}
              </NuxtLink>
              <p v-else class="mt-1 text-sm font-medium text-[var(--mada-dark)]">{{ product.name }}</p>

              <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--mada-muted)]">{{
                t('priceRequest.quantity') }}</p>
              <p class="mt-1 text-sm font-medium text-[var(--mada-dark)]">{{ product.quantity }}</p>

              <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--mada-muted)]">{{
                t('priceRequest.price') }}</p>
              <p class="mt-1 text-sm font-medium text-[var(--mada-dark)]">{{ formatPrice(product.price) }}</p>
            </div>
          </div>
        </div>

        <p v-else class="rounded-xl bg-[var(--mada-soft)] px-4 py-5 text-center text-sm text-[var(--mada-muted)]">
          {{ t('cart.empty') }}
        </p>
      </section>

      <section v-if="currentRequest.notes"
        class="request-card rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:p-6">
        <h2 class="mb-3 text-lg font-semibold text-[var(--mada-dark)]">{{ t('priceRequest.additionalNotes') }}</h2>
        <p class="whitespace-pre-line text-sm leading-7 text-[var(--mada-muted)]">{{ currentRequest.notes }}</p>
      </section>
    </div>

    <div v-else class="rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-8 text-center shadow-sm">
      <p class="text-base font-medium text-[var(--mada-dark)]">{{ t('priceRequest.notFound') }}</p>
      <NuxtLink to="/price-list-requests"
        class="mt-4 inline-flex rounded-md bg-[var(--mada-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t('nav.priceRequests') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { usePriceListRequestStore } from '#imports';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useLocaleStore } from '@/stores/locale';

const localeStore = useLocaleStore();
const t = localeStore.t;

const priceListRequestStore = usePriceListRequestStore();
const currentRequest = computed(() => priceListRequestStore.currentRequest);
const isLoading = computed(() => priceListRequestStore.loading);
const requestError = computed(() => priceListRequestStore.error);
const printedAt = ref(null);
const isNotFound = computed(() => {
  if (isLoading.value || currentRequest.value) {
    return false;
  }

  const message = String(requestError.value || '').toLowerCase();
  return (
    !message ||
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('no query results')
  );
});

const normalizedProducts = computed(() => {
  const products = currentRequest.value?.products;
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map((product) => {
    if (product && typeof product === 'object') {
      const price = product.price ?? product.unit_price ?? product.unitPrice ?? null;
      return {
        id: product.id,
        name: product.name || `#${product.id}`,
        quantity: Number(product.quantity || 1),
        price,
      };
    }

    return {
      id: null,
      name: String(product),
      quantity: 1,
      price: null,
    };
  });
});

const route = useRoute();

function formatStatus(status) {
  if (!status) return t('priceRequest.statusUnknown');

  switch (String(status).toLowerCase()) {
    case 'confirmed':
      return t('priceRequest.statusConfirmed');
    case 'canceled':
      return t('priceRequest.statusCanceled');
    case 'pending':
      return t('priceRequest.statusPending');
    default:
      return t('priceRequest.statusUnknown');
  }
}

function formatDate(date) {
  if (!date) return t('priceRequest.unknownDate');
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return t('priceRequest.invalidDate');
  return dateObj.toLocaleDateString(localeStore.locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(date) {
  if (!date) return t('priceRequest.unknownDate');
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return t('priceRequest.invalidDate');
  return dateObj.toLocaleString(localeStore.locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return 'N/A';
  }

  const normalizedPrice = Number(String(price).replace(/,/g, ''));
  if (!Number.isNaN(normalizedPrice) && Number.isFinite(normalizedPrice)) {
    return normalizedPrice.toLocaleString(localeStore.locale === 'ar' ? 'ar-EG' : 'en-US', {
      maximumFractionDigits: 2,
    });
  }

  return String(price);
}

function markPrintedTime() {
  printedAt.value = new Date();
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-[var(--mada-soft)] text-[var(--mada-dark)]';
  }
}

async function downloadPdf() {
  if (!currentRequest.value) return;

  try {
    const response = await priceListRequestStore.printRequest(currentRequest.value.id);
    const htmlContent = typeof response?.data === 'string' ? response.data : null;

    if (htmlContent) {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const popup = window.open(htmlUrl, '_blank');
      if (!popup) {
        throw new Error('Unable to open print preview window');
      }
      setTimeout(() => {
        popup.focus();
        popup.print();
      }, 300);
      setTimeout(() => {
        URL.revokeObjectURL(htmlUrl);
      }, 5000);
      return;
    }

    const binaryData = response?.data?.data || response?.data || response;
    const blob = binaryData instanceof Blob ? binaryData : new Blob([binaryData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `price-list-request-${currentRequest.value.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert(t('priceRequest.downloadFailed'));
  }
}

async function loadRequest() {
  const requestId = route.params.id;
  if (requestId) {
    await priceListRequestStore.fetchRequestById(requestId).catch(error => {
      console.error('Error fetching price list request:', error);
    });
  }
}

onMounted(() => {
  loadRequest();
  if (import.meta.client) {
    window.addEventListener('beforeprint', markPrintedTime);
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeprint', markPrintedTime);
  }
});

watch(
  () => route.params.id,
  () => {
    loadRequest();
  },
);

</script>


<style>
.print-only {
  display: none;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  html,
  body {
    background: #fff !important;
    height: auto !important;
  }

  body {
    margin: 0;
    color: #111827;
    font-size: 12px;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Keep only page main content; removes app shell sections from print flow */
  #__nuxt>div> :not(main) {
    display: none !important;
  }

  #__nuxt>div,
  #__nuxt>div>main,
  .min-h-screen {
    min-height: auto !important;
    height: auto !important;
  }

  #__nuxt>div {
    display: block !important;
  }

  #__nuxt>div>main {
    flex: none !important;
  }

  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .price-request-page {
    max-width: 100% !important;
    padding: 0 !important;
  }

  .request-page-header {
    margin-bottom: 12px !important;
    border-bottom: 1px solid #d1d5db;
    padding-bottom: 8px;
  }

  .request-page-header h1 {
    font-size: 20px !important;
    line-height: 1.2 !important;
    margin: 0 !important;
  }

  .request-content {
    gap: 12px !important;
  }

  .request-print-header {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 6px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .request-print-header .print-brand {
    margin: 0 0 4px;
    font-size: 11px;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .request-print-header .print-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .request-print-header .print-meta {
    margin: 6px 0 0;
    font-size: 11px;
    color: #4b5563;
    line-height: 1.5;
  }

  .request-overview {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .request-card {
    border: 1px solid #d1d5db !important;
    background: #fff !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .status-badge {
    border: 1px solid #d1d5db;
    padding: 2px 10px !important;
  }

  .products-desktop-table {
    display: table !important;
    width: 100% !important;
    min-width: 100% !important;
    table-layout: fixed;
  }

  .products-desktop-table th,
  .products-desktop-table td {
    border: 1px solid #d1d5db !important;
    padding: 8px !important;
    color: #111827 !important;
    vertical-align: top;
    word-break: break-word;
  }

  .products-desktop-table thead th {
    background: #f3f4f6 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .products-mobile-list {
    display: none !important;
  }

  .request-card a {
    color: #111827 !important;
    text-decoration: none !important;
  }

  .request-products-section tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
