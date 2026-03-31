<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <nav class="mb-8 text-sm text-[var(--mada-muted)]">
      <router-link to="/" class="text-[var(--mada-primary)] hover:underline">{{ t('common.home') }}</router-link>
      <span class="mx-2">/</span>
      <router-link v-if="categoryRouteId" :to="`/category/${categoryRouteId}`"
        class="text-[var(--mada-primary)] hover:underline">
        {{ productCategoryName || t('common.categories') }}
      </router-link>
      <template v-if="categoryRouteId">
        <span class="mx-2">/</span>
      </template>
      <span class="font-medium text-[var(--mada-dark)]">{{ product?.name || t('product.productDetails') }}</span>
    </nav>

    <div v-if="productStore.loading" class="px-4 py-16 text-center text-[var(--mada-muted)]">
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="productStore.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center text-red-700">
      <p class="text-base font-semibold">{{ productStore.error }}</p>
      <button @click="loadProduct"
        class="mt-4 rounded-xl bg-[var(--mada-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t('common.retry') }}
      </button>
    </div>

    <div v-else-if="product" class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <section>
        <div class="group relative overflow-hidden rounded-2xl border border-[var(--mada-border)] bg-white">
          <button type="button" class="absolute inset-0 z-10 cursor-zoom-in"
            :aria-label="t('product.openImageFullscreen')" @click="openImageFullscreen(activeImage)" />
          <img :src="activeImage" :alt="product.name"
            class="h-[380px] w-full object-contain bg-[var(--mada-soft)] md:h-[470px]" />
          <button type="button"
            class="pointer-events-none absolute bottom-3 end-3 rounded-md bg-black/65 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            {{ t('product.fullscreen') }}
          </button>
        </div>

        <div v-if="images.length > 1" class="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
          <button v-for="image in images" :key="image" type="button"
            class="overflow-hidden rounded-lg border transition"
            :class="activeImage === image ? 'border-[var(--mada-primary)] ring-2 ring-[var(--mada-primary)]/20' : 'border-[var(--mada-border)]'"
            @click="activeImage = image">
            <img :src="image" :alt="product.name" class="h-16 w-full object-cover" />
          </button>
        </div>
      </section>

      <section>
        <h1 class="text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">{{ product.name }}</h1>

        <div
          class="mt-5 grid grid-cols-1 gap-2 rounded-xl border border-[var(--mada-border)] bg-white p-4 text-sm text-[var(--mada-dark)] sm:grid-cols-2">
          <p v-if="product.sku"><strong>{{ t('product.sku') }}:</strong> {{ product.sku }}</p>
          <p v-if="product.barcode"><strong>{{ t('product.barcode') }}:</strong> {{ product.barcode }}</p>
          <p v-if="productBrand"><strong>{{ t('product.brand') }}:</strong> {{ productBrand }}</p>
          <p v-if="productUnit"><strong>{{ t('product.unit') }}:</strong> {{ productUnit }}</p>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <div class="inline-flex items-center rounded-xl border border-[var(--mada-border)] bg-white">
            <button type="button"
              class="h-11 w-11 rounded-s-xl text-xl font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)]"
              @click="decreaseQty" :aria-label="t('cart.decreaseQuantity')">
              -
            </button>
            <input v-model.number="qty" type="number" min="1"
              class="h-11 w-16 border-x border-[var(--mada-border)] bg-transparent text-center text-sm font-semibold text-[var(--mada-dark)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              :aria-label="t('cart.quantity')" @change="handleQtyInput" />
            <button type="button"
              class="h-11 w-11 rounded-e-xl text-xl font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)]"
              @click="increaseQty" :aria-label="t('cart.increaseQuantity')">
              +
            </button>
          </div>

          <button type="button" class="h-11 rounded-xl px-6 text-sm font-semibold text-white transition"
            :class="inCart ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--mada-primary)] hover:bg-[var(--mada-primary-hover)]'"
            @click="toggleCart">
            {{ inCart ? t('product.removeFromCart') : t('product.addToCart') }}
          </button>
        </div>

        <article v-if="product.description"
          class="prose mt-7 max-w-none rounded-xl border border-[var(--mada-border)] bg-white p-5 text-[var(--mada-dark)] prose-headings:text-[var(--mada-dark)] prose-a:text-[var(--mada-primary)] prose-img:rounded-xl">
          <h2 class="mb-3 text-xl font-semibold text-[var(--mada-dark)]">{{ t('product.description') }}</h2>
          <div
            class="text-[15px] leading-7 text-[var(--mada-muted)] [&_a]:text-[var(--mada-primary)] [&_a]:underline [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5"
            v-html="product.description"></div>
        </article>
      </section>
    </div>

    <section v-if="product" class="mt-12">
      <div class="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-[var(--mada-dark)]">
            {{ t('product.relatedProducts') }}
          </h2>
          <p class="text-sm text-[var(--mada-muted)]">
            {{ t('product.relatedProductsSubtitle') }}
          </p>
        </div>
      </div>

      <div v-if="relatedLoading" class="overflow-x-auto pb-2">
        <div class="flex min-w-max snap-x snap-mandatory gap-4">
          <div v-for="placeholder in 4" :key="`related-skeleton-${placeholder}`"
            class="w-[250px] shrink-0 snap-start overflow-hidden rounded-lg border border-[var(--mada-border)] bg-white shadow-sm">
            <div class="h-48 w-full animate-pulse bg-[var(--mada-soft)]"></div>
            <div class="space-y-3 p-4">
              <div class="h-4 w-3/4 animate-pulse rounded bg-[var(--mada-soft)]"></div>
              <div class="h-4 w-1/2 animate-pulse rounded bg-[var(--mada-soft)]"></div>
              <div class="h-9 w-full animate-pulse rounded bg-[var(--mada-soft)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="relatedError"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center text-red-700">
        <p class="font-semibold">{{ t('product.relatedProductsLoadFailed') }}</p>
        <button type="button"
          class="mt-3 rounded-lg bg-[var(--mada-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]"
          @click="loadRelatedProducts">
          {{ t('common.retry') }}
        </button>
      </div>

      <div v-else-if="relatedProducts.length === 0"
        class="rounded-xl border border-[var(--mada-border)] bg-white px-5 py-8 text-center text-[var(--mada-muted)]">
        <p>{{ t('product.noRelatedProducts') }}</p>
      </div>

      <div v-else class="overflow-x-auto pb-2">
        <div class="flex min-w-max snap-x snap-mandatory gap-4">
          <div v-for="relatedProduct in relatedProducts" :key="relatedProduct.id" class="w-[250px] shrink-0 snap-start">
            <ProductCard :product="relatedProduct" />
          </div>
        </div>
      </div>
    </section>

    <div v-else class="px-4 py-16 text-center text-[var(--mada-muted)]">
      <p class="text-lg">{{ t('product.productNotFound') }}</p>
      <router-link to="/"
        class="mt-5 inline-block rounded-xl bg-[var(--mada-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t('common.backToHome') }}
      </router-link>
    </div>

    <Teleport to="body">
      <div v-if="isImageFullscreenOpen"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 md:p-8"
        @click="closeImageFullscreen">
        <button type="button"
          class="absolute top-4 end-4 rounded-lg border border-white/30 bg-black/40 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black/60"
          :aria-label="t('product.closeImageFullscreen')" @click.stop="closeImageFullscreen">
          ×
        </button>
        <img :src="fullscreenImage" :alt="product?.name || t('product.productDetails')"
          class="max-h-[92vh] max-w-full rounded-xl object-contain" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useCartStore } from "@/stores/cart";
import { useLocaleStore } from "@/stores/locale";
import { productAPI } from "@/services/api";
import ProductCard from "@/components/ProductCard.vue";

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();
const localeStore = useLocaleStore();
const t = localeStore.t;

const qty = ref(1);
const activeImage = ref("");
const relatedProducts = ref([]);
const relatedLoading = ref(false);
const relatedError = ref(null);
const isImageFullscreenOpen = ref(false);
const fullscreenImage = ref("");
let originalBodyOverflow = "";

const productId = computed(() => route.params.id);
const product = computed(() => productStore.currentProduct);
const cartItem = computed(() => {
  if (!product.value?.id) {
    return null;
  }
  return cartStore.getItemByProductId(product.value.id) || null;
});

const images = computed(() => {
  const item = product.value;
  if (!item) {
    return [];
  }

  const list = [];

  const pushImage = (value) => {
    if (!value || typeof value !== "string") {
      return;
    }
    const trimmed = value.trim();
    if (!trimmed || list.includes(trimmed)) {
      return;
    }
    list.push(trimmed);
  };

  pushImage(item.thumbnail_image);
  pushImage(item.image);
  pushImage(item.main_image);
  pushImage(item.banner);

  const photoSources = Array.isArray(item.photos)
    ? item.photos
    : typeof item.photos === "string"
      ? item.photos.split(",")
      : Array.isArray(item.images)
        ? item.images
        : [];

  photoSources.forEach((photo) => {
    if (typeof photo === "string") {
      pushImage(photo);
      return;
    }
    if (photo && typeof photo === "object") {
      pushImage(photo.path || photo.url || photo.image || photo.thumbnail_image);
    }
  });

  return list;
});

const categoryRouteId = computed(() => {
  return (
    product.value?.category_id ||
    product.value?.category?.id ||
    null
  );
});

const productCategoryName = computed(() => {
  return (
    product.value?.category_name ||
    product.value?.category?.name ||
    ""
  );
});

const productBrand = computed(() => {
  return (
    product.value?.brand_name ||
    product.value?.brand?.name ||
    ""
  );
});

const productUnit = computed(() => {
  return product.value?.unit || product.value?.unit_name || "";
});

const inCart = computed(() => {
  return Boolean(cartItem.value);
});

watch(
  images,
  (list) => {
    if (!list.length) {
      activeImage.value = "";
      closeImageFullscreen();
      return;
    }
    if (!activeImage.value || !list.includes(activeImage.value)) {
      activeImage.value = list[0];
    }
  },
  { immediate: true },
);

watch(
  productId,
  async () => {
    qty.value = 1;
    closeImageFullscreen();
    await loadProduct();
  },
);

watch(
  cartItem,
  (item) => {
    if (item?.quantity) {
      qty.value = Number(item.quantity);
    }
  },
  { immediate: true },
);

async function loadProduct() {
  await productStore.fetchProductById(productId.value);

  if (!productStore.currentProduct || productStore.error) {
    relatedProducts.value = [];
    relatedError.value = null;
    return;
  }

  await loadRelatedProducts();
}

function normalizeProductList(payload) {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
}

async function loadRelatedProducts() {
  if (!productId.value) {
    relatedProducts.value = [];
    relatedError.value = null;
    return;
  }

  relatedLoading.value = true;
  relatedError.value = null;

  try {
    const data = await productAPI.getRelated(productId.value);
    const currentProductId = Number(productId.value);
    const normalized = normalizeProductList(data)
      .filter((item) => item && item.id)
      .filter((item) => Number(item.id) !== currentProductId);

    relatedProducts.value = normalized.slice(0, 8);
  } catch (error) {
    relatedProducts.value = [];
    relatedError.value = error?.message || "Unable to load related products.";
  } finally {
    relatedLoading.value = false;
  }
}

function increaseQty() {
  setQty(qty.value + 1);
}

function decreaseQty() {
  setQty(qty.value - 1);
}

function normalizeQty(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.max(1, Math.floor(parsed));
}

function setQty(value) {
  qty.value = normalizeQty(value);

  if (product.value?.id && inCart.value) {
    cartStore.updateQuantity(product.value.id, qty.value);
  }
}

function handleQtyInput() {
  setQty(qty.value);
}

function openImageFullscreen(image) {
  if (!image || typeof image !== "string") {
    return;
  }
  fullscreenImage.value = image;
  isImageFullscreenOpen.value = true;
}

function closeImageFullscreen() {
  isImageFullscreenOpen.value = false;
  fullscreenImage.value = "";
}

function handleKeydown(event) {
  if (event.key === "Escape" && isImageFullscreenOpen.value) {
    closeImageFullscreen();
  }
}

function toggleCart() {
  if (!product.value) {
    return;
  }

  if (inCart.value) {
    cartStore.removeFromCart(product.value.id);
    qty.value = 1;
    return;
  }

  cartStore.addToCart(product.value, normalizeQty(qty.value));
}

onMounted(async () => {
  if (typeof document !== "undefined") {
    document.addEventListener("keydown", handleKeydown);
  }
  await loadProduct();
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = originalBodyOverflow;
  }
});

watch(isImageFullscreenOpen, (isOpen) => {
  if (typeof document === "undefined") {
    return;
  }

  if (isOpen) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return;
  }

  document.body.style.overflow = originalBodyOverflow;
});
</script>
