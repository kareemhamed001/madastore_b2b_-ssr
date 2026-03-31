<template>
  <div class="relative mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-10 start-0 h-60 w-60 rounded-full bg-[var(--mada-primary)]/10 blur-3xl"></div>
      <div class="absolute top-24 end-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"></div>
    </div>

    <header
      class="mb-6 grid gap-5 rounded-[2rem] border border-[#dbeeff] bg-white/85 p-5 shadow-[0_20px_60px_rgba(6,138,232,0.1)] backdrop-blur md:mb-8 md:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
      <div>
        <p
          class="inline-flex items-center rounded-full border border-[#cfe9ff] bg-[#f2f9ff] px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--mada-primary)] md:text-sm">
          {{ t("home.badge") }}
        </p>

        <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-[var(--mada-dark)] md:text-5xl">
          {{ t("home.title") }}
        </h1>

        <p class="mt-3 max-w-2xl text-base text-[var(--mada-muted)] md:text-lg">
          {{ t("home.subtitle") }}
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-2.5">
          <span class="rounded-full bg-[var(--mada-primary)] px-4 py-1.5 text-sm font-semibold text-white">
            {{ t("home.categoriesCount", { count: activeCount }) }}
          </span>
          <span
            class="rounded-full border border-[var(--mada-border)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--mada-dark)]">
            {{ t("home.unlimitedDepth") }}
          </span>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink :to="primaryCategoryRoute"
            class="rounded-xl bg-[var(--mada-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
            {{ t("home.startOrdering") }}
          </RouterLink>
          <RouterLink to="/price-list-requests"
            class="rounded-xl border border-[var(--mada-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
            {{ t("home.requestBulkQuote") }}
          </RouterLink>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-2">
          <span
            class="rounded-full border border-[var(--mada-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--mada-muted)]">
            {{ t("home.trustFastQuote") }}
          </span>
          <span
            class="rounded-full border border-[var(--mada-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--mada-muted)]">
            {{ t("home.trustBusinessSupport") }}
          </span>
          <span
            class="rounded-full border border-[var(--mada-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--mada-muted)]">
            {{ t("home.trustWideCatalog") }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <div class="rounded-2xl border border-[var(--mada-border)] bg-[var(--mada-soft)]/80 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--mada-muted)]">
            {{ t("home.topLevelCount") }}
          </p>
          <p class="mt-2 text-3xl font-extrabold leading-none text-[var(--mada-dark)]">
            {{ rootCategories.length }}
          </p>
        </div>
        <div class="rounded-2xl border border-[var(--mada-border)] bg-[var(--mada-soft)]/80 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--mada-muted)]">
            {{ t("home.totalLoadedCount") }}
          </p>
          <p class="mt-2 text-3xl font-extrabold leading-none text-[var(--mada-dark)]">
            {{ categories.length }}
          </p>
        </div>
      </div>
    </header>

    <section class="mb-7 rounded-2xl border border-[var(--mada-border)] bg-white p-3 shadow-sm md:p-4">
      <label for="category-search" class="sr-only">{{ t("home.searchCategoriesLabel") }}</label>
      <div
        class="flex items-center gap-3 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-[var(--mada-muted)]" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input id="category-search" v-model.trim="searchQuery" type="search"
          :placeholder="t('home.searchCategoriesPlaceholder')"
          class="w-full border-0 bg-transparent text-[var(--mada-dark)] outline-none placeholder:text-[var(--mada-muted)]" />
        <button v-if="searchQuery" type="button"
          class="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-[var(--mada-primary)] transition hover:bg-[var(--mada-primary)] hover:text-white"
          @click="searchQuery = ''">
          {{ t("common.clear") }}
        </button>
      </div>
    </section>

    <div v-if="categoryStore.loading" class="grid gap-3 px-1 py-10 md:gap-4">
      <div v-for="n in 7" :key="n" class="h-24 animate-pulse rounded-2xl border border-[var(--mada-border)] bg-white">
      </div>
    </div>

    <div v-else-if="categoryStore.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center text-red-700">
      <p class="text-base font-semibold">{{ t("home.errorLoadingCategories") }}</p>
      <p class="mt-1 text-sm">{{ categoryStore.error }}</p>
      <button @click="loadCategories"
        class="mt-5 rounded-xl bg-[var(--mada-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--mada-primary-hover)]">
        {{ t("common.retry") }}
      </button>
    </div>

    <section v-else-if="isSearching && matchedCategories.length === 0"
      class="rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-10 text-center text-[var(--mada-muted)]">
      {{ t("home.noCategoriesMatch", { query: searchQuery }) }}
    </section>

    <section v-else-if="isSearching">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-xl font-bold text-[var(--mada-dark)] md:text-2xl">
          {{ t("home.searchResultsTitle") }}
        </h2>
        <span
          class="rounded-full border border-[var(--mada-border)] bg-white px-3 py-1 text-sm font-semibold text-[var(--mada-muted)]">
          {{ matchedCategories.length }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <RouterLink v-for="category in matchedCategories" :key="category.id" :to="`/category/${category.id}`"
          class="group rounded-2xl border border-[var(--mada-border)] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--mada-primary)] hover:shadow-md">
          <div class="flex items-center gap-3">
            <div class="h-14 w-14 overflow-hidden rounded-xl bg-[var(--mada-soft)]">
              <img v-if="categoryPreviewImage(category)" :src="categoryPreviewImage(category)" :alt="category.name"
                class="h-full w-full object-cover" loading="lazy" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-[var(--mada-dark)]">{{ category.name }}</p>
              <p class="mt-1 truncate text-xs text-[var(--mada-muted)]">{{ getCategoryPath(category) }}</p>
            </div>
            <span class="text-[var(--mada-muted)] transition group-hover:text-[var(--mada-primary)]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </span>
          </div>
        </RouterLink>
      </div>
    </section>

    <section v-else class="space-y-3 md:space-y-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-[var(--mada-dark)] md:text-2xl">{{ t("home.browseTreeTitle") }}</h2>
      </div>
      <CategoryAccordionItem v-for="category in rootCategories" :key="category.id" :category="category" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useCategoryStore } from "@/stores/category";
import { useLocaleStore } from "@/stores/locale";
import CategoryAccordionItem from "@/components/CategoryAccordionItem.vue";

const categoryStore = useCategoryStore();
const localeStore = useLocaleStore();
const searchQuery = ref("");
const t = localeStore.t;

const categories = computed(() => {
  return categoryStore.allCategories.filter(
    (category) => category && category.id,
  );
});

const isSearching = computed(() => searchQuery.value.trim().length > 0);

const rootCategories = computed(() => {
  const tree = categoryStore.categoryTree.filter(
    (category) => category && category.id,
  );
  if (tree.length > 0) {
    return tree;
  }
  return categories.value.filter((category) => !category.parent_id);
});

const matchedCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return [];
  }
  return categoryStore.allCategories
    .filter((category) => category && category.id)
    .filter((category) =>
      String(category.name || "").toLowerCase().includes(query),
    );
});

const activeCount = computed(() => {
  return isSearching.value ? matchedCategories.value.length : rootCategories.value.length;
});

const primaryCategoryRoute = computed(() => {
  const firstCategoryId = rootCategories.value[0]?.id;
  if (firstCategoryId) {
    return `/category/${firstCategoryId}`;
  }
  return '/';
});

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  await categoryStore.fetchCategories();
}

function getCategoryPath(category) {
  const all = categoryStore.allCategories;
  const byId = new Map(
    all.filter((item) => item && item.id).map((item) => [item.id, item]),
  );
  const path = [category.name];
  let current = category;
  const seen = new Set([category.id]);

  while (current?.parent_id && byId.has(current.parent_id)) {
    const parent = byId.get(current.parent_id);
    if (!parent || seen.has(parent.id)) {
      break;
    }
    path.unshift(parent.name);
    seen.add(parent.id);
    current = parent;
  }

  return path.join(" / ");
}

function categoryPreviewImage(category) {
  return category?.banner || category?.icon || category?.image || "";
}
</script>
