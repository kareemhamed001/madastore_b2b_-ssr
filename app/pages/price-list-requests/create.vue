<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
    <header class="mb-6 rounded-3xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:mb-8 md:p-7">
      <NuxtLink
        to="/cart"
        class="inline-flex items-center text-sm font-medium text-[var(--mada-primary)] transition hover:underline"
      >
        {{ t("nav.cart") }}
      </NuxtLink>
      <h1 class="mt-3 text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">{{ t("priceRequest.title") }}</h1>
      <p class="mt-2 max-w-3xl text-sm text-[var(--mada-muted)] md:text-base">
        {{ t("priceRequest.subtitle") }}
      </p>
    </header>

    <section
      v-if="cartStore.itemCount === 0 && !successMessage"
      class="rounded-3xl border border-[var(--mada-border)] bg-white px-6 py-10 text-center shadow-sm md:px-10"
    >
      <h2 class="text-xl font-semibold text-[var(--mada-dark)]">{{ t("priceRequest.emptyCartTitle") }}</h2>
      <p class="mt-2 text-sm text-[var(--mada-muted)] md:text-base">{{ t("priceRequest.emptyCartHint") }}</p>
      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <NuxtLink
          to="/cart"
          class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]"
        >
          {{ t("priceRequest.backToCart") }}
        </NuxtLink>
        <NuxtLink
          to="/"
          class="rounded-xl bg-[var(--mada-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]"
        >
          {{ t("priceRequest.browseProducts") }}
        </NuxtLink>
      </div>
    </section>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section class="rounded-3xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:p-7">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-[var(--mada-dark)] md:text-2xl">{{ t("priceRequest.yourInformation") }}</h2>
          <p class="mt-1 text-sm text-[var(--mada-muted)]">{{ t("priceRequest.formHint") }}</p>
        </div>

        <div
          v-if="successMessage"
          role="status"
          class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <p>{{ successMessage }}</p>
          <div class="mt-3 flex flex-wrap gap-3">
            <button
              v-if="createdRequestId"
              @click="goToCreatedRequest"
              class="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              {{ t("priceRequest.viewCreatedRequest") }}
            </button>
            <p class="text-xs font-medium text-emerald-700">{{ t("priceRequest.redirecting", { seconds: redirectSeconds }) }}</p>
          </div>
        </div>

        <div
          v-if="errorMessage"
          role="alert"
          class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="name" class="mb-1.5 block text-sm font-semibold text-[var(--mada-dark)]">
              {{ t("priceRequest.fullName") }}
            </label>
            <input
              id="name"
              v-model.trim="customerInfo.name"
              type="text"
              :placeholder="t('priceRequest.fullNamePlaceholder')"
              :class="inputClass('name')"
              :aria-invalid="showFieldError('name') ? 'true' : 'false'"
              @blur="markTouched('name')"
            />
            <p v-if="showFieldError('name')" class="mt-1 text-xs font-medium text-red-600">{{ validationErrors.name }}</p>
          </div>

          <div>
            <label for="email" class="mb-1.5 block text-sm font-semibold text-[var(--mada-dark)]">
              {{ t("priceRequest.emailAddress") }}
            </label>
            <input
              id="email"
              v-model.trim="customerInfo.email"
              type="email"
              :placeholder="t('priceRequest.emailPlaceholder')"
              :class="inputClass('email')"
              :aria-invalid="showFieldError('email') ? 'true' : 'false'"
              @blur="markTouched('email')"
            />
            <p v-if="showFieldError('email')" class="mt-1 text-xs font-medium text-red-600">{{ validationErrors.email }}</p>
          </div>

          <div>
            <label for="phone" class="mb-1.5 block text-sm font-semibold text-[var(--mada-dark)]">
              {{ t("priceRequest.phoneNumber") }}
            </label>
            <input
              id="phone"
              v-model.trim="customerInfo.phone"
              type="tel"
              :placeholder="t('priceRequest.phonePlaceholder')"
              :class="inputClass('phone')"
              :aria-invalid="showFieldError('phone') ? 'true' : 'false'"
              @blur="markTouched('phone')"
            />
            <p v-if="showFieldError('phone')" class="mt-1 text-xs font-medium text-red-600">{{ validationErrors.phone }}</p>
          </div>

          <div class="sm:col-span-2">
            <label for="company" class="mb-1.5 block text-sm font-semibold text-[var(--mada-dark)]">
              {{ t("priceRequest.companyName") }}
            </label>
            <input
              id="company"
              v-model.trim="customerInfo.company"
              type="text"
              :placeholder="t('priceRequest.companyPlaceholder')"
              :class="inputClass('company')"
              :aria-invalid="showFieldError('company') ? 'true' : 'false'"
              @blur="markTouched('company')"
            />
            <p v-if="showFieldError('company')" class="mt-1 text-xs font-medium text-red-600">{{ validationErrors.company }}</p>
          </div>

          <div class="sm:col-span-2">
            <div class="mb-1.5 flex items-center justify-between gap-3">
              <label for="notes" class="block text-sm font-semibold text-[var(--mada-dark)]">
                {{ t("priceRequest.additionalNotes") }}
              </label>
              <span class="text-xs text-[var(--mada-muted)]">{{ notesCountLabel }}</span>
            </div>
            <textarea
              id="notes"
              v-model="customerInfo.notes"
              rows="4"
              :maxlength="MAX_NOTES_LENGTH"
              :placeholder="t('priceRequest.notesPlaceholder')"
              :class="inputClass('notes')"
              @blur="markTouched('notes')"
            />
          </div>
        </form>
      </section>

      <aside class="h-fit rounded-3xl border border-[var(--mada-border)] bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 class="text-lg font-semibold text-[var(--mada-dark)]">{{ t("priceRequest.selectedProducts") }}</h2>
        <p class="mt-1 text-xs text-[var(--mada-muted)]">{{ t("priceRequest.selectedProductsHint") }}</p>

        <div class="mt-4 max-h-[22rem] space-y-2 overflow-y-auto pe-1">
          <article
            v-for="item in cartStore.cartItems"
            :key="item.product.id"
            class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-3"
          >
            <p class="text-sm font-semibold text-[var(--mada-dark)]">{{ getProductName(item.product) }}</p>
            <div class="mt-2 flex items-center justify-between gap-3 text-xs">
              <p v-if="item.product.sku" class="text-[var(--mada-muted)]">SKU: {{ item.product.sku }}</p>
              <p class="rounded-full border border-[var(--mada-border)] bg-white px-2 py-0.5 font-semibold text-[var(--mada-dark)]">
                {{ t("priceRequest.qty") }}: {{ item.quantity }}
              </p>
            </div>
          </article>
        </div>

        <div class="mt-4 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-3 text-sm">
          <p class="flex items-center justify-between text-[var(--mada-dark)]">
            <span>{{ t("priceRequest.totalItems") }}</span>
            <strong>{{ cartStore.itemCount }}</strong>
          </p>
          <p class="mt-2 flex items-center justify-between text-[var(--mada-dark)]">
            <span>{{ t("priceRequest.uniqueProducts") }}</span>
            <strong>{{ cartStore.uniqueProductCount }}</strong>
          </p>
        </div>

        <div class="mt-4 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-3">
          <p class="text-xs font-semibold text-[var(--mada-dark)]">{{ t("cart.nextStepsTitle") }}</p>
          <p class="mt-1 text-xs leading-6 text-[var(--mada-muted)]">{{ t("cart.nextStepsText") }}</p>
        </div>

        <div class="mt-5 flex flex-col gap-2">
          <button
            @click="handleSubmit"
            :disabled="!canSubmit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--mada-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="submitting"
              class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            ></span>
            <span>{{ submitting ? t("priceRequest.submitting") : t("priceRequest.submitRequest") }}</span>
          </button>
          <button
            @click="handleCancel"
            :disabled="submitting"
            class="rounded-xl border border-[var(--mada-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ t("common.cancel") }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useLocaleStore } from "@/stores/locale";
import { usePriceListRequestStore } from "@/stores/priceListRequest";

definePageMeta({
  name: "price-list-request",
  requiresAuth: true,
});

const MAX_NOTES_LENGTH = 500;
const REDIRECT_DELAY_MS = 3000;

const router = useRouter();
const auth = useAuthStore();
const cartStore = useCartStore();
const localeStore = useLocaleStore();
const priceListRequestStore = usePriceListRequestStore();
const t = localeStore.t;

const customerInfo = reactive({
  name: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
});

const touched = reactive({
  name: false,
  email: false,
  phone: false,
  company: false,
  notes: false,
});

const submitting = ref(false);
const submitAttempted = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const createdRequestId = ref(null);
const redirectSeconds = ref(Math.floor(REDIRECT_DELAY_MS / 1000));

let redirectTimeout = null;
let redirectCountdownTimer = null;

useHead(() => ({
  title: `${t("priceRequest.title")} — Madastore B2B`,
  meta: [{ name: "description", content: t("priceRequest.subtitle") }],
}));

const validationErrors = computed(() => {
  const errors = {
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  };

  if (!customerInfo.name.trim()) {
    errors.name = t("priceRequest.requiredField");
  }

  if (!customerInfo.email.trim()) {
    errors.email = t("priceRequest.requiredField");
  } else if (!isValidEmail(customerInfo.email)) {
    errors.email = t("priceRequest.invalidEmail");
  }

  if (!customerInfo.phone.trim()) {
    errors.phone = t("priceRequest.requiredField");
  } else if (!isValidPhone(customerInfo.phone)) {
    errors.phone = t("priceRequest.invalidPhone");
  }

  if (!customerInfo.company.trim()) {
    errors.company = t("priceRequest.requiredField");
  }

  if ((customerInfo.notes || "").length > MAX_NOTES_LENGTH) {
    errors.notes = t("priceRequest.notesTooLong");
  }

  return errors;
});

const canSubmit = computed(() => {
  if (submitting.value || !cartStore.itemCount || Boolean(successMessage.value)) {
    return false;
  }

  return Object.values(validationErrors.value).every((value) => !value);
});

const notesCountLabel = computed(() =>
  t("priceRequest.notesCount", {
    count: (customerInfo.notes || "").length,
    max: MAX_NOTES_LENGTH,
  }),
);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isValidPhone(phone) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  return digits.length >= 7;
}

function markTouched(field) {
  if (Object.hasOwn(touched, field)) {
    touched[field] = true;
  }
}

function showFieldError(field) {
  if (!Object.hasOwn(validationErrors.value, field)) {
    return false;
  }

  return (submitAttempted.value || touched[field]) && Boolean(validationErrors.value[field]);
}

function inputClass(field) {
  const hasError = showFieldError(field);
  return [
    "w-full rounded-xl border px-3 py-2.5 text-sm text-[var(--mada-dark)] outline-none transition",
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400"
      : "border-[var(--mada-border)] bg-white focus:border-[var(--mada-primary)]",
  ];
}

function getProductName(product) {
  const localizedName = cartStore.getLocalizedProductName(product, localeStore.locale);
  if (localizedName) {
    return localizedName;
  }
  return product?.name || `#${product?.id || "-"}`;
}

function fillEmptyField(fieldName, value) {
  if (!customerInfo[fieldName] && value) {
    customerInfo[fieldName] = String(value).trim();
  }
}

function prefillCustomerInfo() {
  if (cartStore.customerInfo && typeof cartStore.customerInfo === "object") {
    Object.assign(customerInfo, {
      ...customerInfo,
      ...cartStore.customerInfo,
    });
  }

  const user = auth.user;
  if (!user || typeof user !== "object") {
    return;
  }

  fillEmptyField("name", user.name || user.full_name || user.fullName);
  fillEmptyField("email", user.email);
  fillEmptyField("phone", user.phone || user.mobile);
  fillEmptyField("company", user.company_name || user.company || user.business_name);
}

function clearRedirectTimers() {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }

  if (redirectCountdownTimer) {
    clearInterval(redirectCountdownTimer);
    redirectCountdownTimer = null;
  }
}

function startRedirectToRequest() {
  clearRedirectTimers();
  redirectSeconds.value = Math.floor(REDIRECT_DELAY_MS / 1000);

  redirectCountdownTimer = setInterval(() => {
    if (redirectSeconds.value > 1) {
      redirectSeconds.value -= 1;
      return;
    }

    if (redirectCountdownTimer) {
      clearInterval(redirectCountdownTimer);
      redirectCountdownTimer = null;
    }
  }, 1000);

  redirectTimeout = setTimeout(() => {
    goToCreatedRequest();
  }, REDIRECT_DELAY_MS);
}

async function goToCreatedRequest() {
  clearRedirectTimers();
  cartStore.clearCart();

  if (createdRequestId.value) {
    await router.push(`/price-list-requests/${createdRequestId.value}`);
    return;
  }

  await router.push("/price-list-requests");
}

async function handleSubmit() {
  submitAttempted.value = true;
  Object.keys(touched).forEach((field) => {
    touched[field] = true;
  });

  if (!canSubmit.value) {
    return;
  }

  cartStore.updateCustomerInfo(customerInfo);

  submitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";
  createdRequestId.value = null;

  try {
    const requestData = cartStore.preparePriceListRequest(localeStore.locale);
    const createdRequest = await priceListRequestStore.createRequest(requestData);
    createdRequestId.value = createdRequest?.id || null;
    successMessage.value = t("priceRequest.success");
    startRedirectToRequest();
  } catch (error) {
    errorMessage.value = t("priceRequest.failed");
    console.error("Error submitting price list request:", error);
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  router.push("/cart");
}

onMounted(() => {
  prefillCustomerInfo();
});

onBeforeUnmount(() => {
  clearRedirectTimers();
});
</script>
