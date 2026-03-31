<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <nav v-if="categoryStore.currentCategory" class="mb-8 text-sm text-[var(--mada-muted)]">
      <router-link to="/" class="text-[var(--mada-primary)] hover:underline">
        {{ t('common.home') }}
      </router-link>
      <span class="mx-2">/</span>
      <span class="font-medium text-[var(--mada-dark)]">
        {{ categoryStore.currentCategory.name }}
      </span>
    </nav>

    <div v-if="categoryStore.loading || productStore.loading" class="px-4 py-12 text-center text-[var(--mada-muted)]">
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="categoryStore.error || productStore.error" class="px-4 py-12 text-center text-red-600">
      <p>Error: {{ categoryStore.error || productStore.error }}</p>
      <button
        class="mt-4 rounded-md bg-[var(--mada-primary)] px-6 py-3 text-white transition hover:bg-[var(--mada-primary-hover)]"
        @click="loadData">
        {{ t('common.retry') }}
      </button>
    </div>

    <div v-else-if="categoryStore.currentCategory">
      <header class="mb-12">
        <h1 class="mb-2 text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">
          {{ categoryStore.currentCategory.name }}
        </h1>
        <p v-if="categoryStore.currentCategory.description" class="text-base text-[var(--mada-muted)] md:text-lg">
          {{ categoryStore.currentCategory.description }}
        </p>
      </header>

      <div v-if="childCategories.length > 0" class="mb-12">
        <h2 class="mb-6 text-2xl font-semibold text-[var(--mada-dark)]">
          {{ t('category.subCategories') }}
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CategoryCard v-for="category in childCategories" :key="category.id" :category="category" />
        </div>
      </div>

      <div class="mt-12">
        <div class="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-semibold text-[var(--mada-dark)]">
              {{ t('common.products') }}
            </h2>
            <p class="text-sm text-[var(--mada-muted)]">
              {{ t('category.productsFound', { count: productStore.pagination.total }) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <RouterLink to="/cart"
              class="hidden rounded-lg border border-[var(--mada-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--mada-dark)] shadow-sm transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] lg:inline-flex">
              {{ t('category.viewCartCta', { count: cartStore.itemCount }) }}
            </RouterLink>
            <button type="button"
              class="rounded-lg border border-[var(--mada-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--mada-dark)] shadow-sm transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] lg:hidden"
              @click="mobileFiltersOpen = true">
              {{ t('category.openFilters') }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside class="hidden w-full lg:sticky lg:top-24 lg:block lg:w-72 lg:flex-none">
            <div class="space-y-4">
              <div class="rounded-2xl border border-[var(--mada-border)] bg-white p-4 shadow-sm">
                <p class="text-sm font-bold text-[var(--mada-dark)]">{{ t('category.quoteAssistTitle') }}</p>
                <p class="mt-1 text-xs leading-6 text-[var(--mada-muted)]">
                  {{ t('category.quoteAssistSubtitle') }}
                </p>
                <div
                  class="mt-3 flex items-center justify-between rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-3 py-2">
                  <span class="text-xs font-semibold text-[var(--mada-muted)]">{{ t('category.selectedItems') }}</span>
                  <span class="text-sm font-bold text-[var(--mada-dark)]">{{ cartStore.itemCount }}</span>
                </div>
                <RouterLink to="/cart"
                  class="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[var(--mada-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
                  {{ t('category.openCartCta') }}
                </RouterLink>
              </div>

              <ProductFiltersSidebar :filters="activeFilters" :filter-options="productStore.filterOptions"
                :loading-options="productStore.filterOptionsLoading" @apply="applySidebarFilters"
                @clear="clearAllFilters" />
            </div>
          </aside>

          <div class="min-w-0 flex-1">
            <div v-if="activeFilterChips.length > 0" class="mb-4">
              <p class="mb-2 text-sm font-semibold text-[var(--mada-dark)]">
                {{ t('category.activeFilters') }}
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <span v-for="chip in activeFilterChips" :key="chip.id"
                  class="inline-flex items-center gap-1.5 rounded-full border border-[var(--mada-border)] bg-[var(--mada-soft)] px-3 py-1 text-xs text-[var(--mada-dark)]">
                  <span>{{ chip.label }}</span>
                  <button type="button"
                    class="rounded-full px-1 text-[var(--mada-muted)] transition hover:text-[var(--mada-primary)]"
                    @click="removeFilterChip(chip)">
                    &times;
                  </button>
                </span>
                <button type="button"
                  class="text-xs font-semibold text-[var(--mada-primary)] transition hover:text-[var(--mada-primary-hover)]"
                  @click="clearAllFilters">
                  {{ t('category.clearAllFilters') }}
                </button>
              </div>
            </div>

            <ProductList :products="productStore.products" :loading="productStore.loading"
              :empty-message="emptyProductsMessage" />

            <Pagination v-if="productStore.pagination.totalPages > 1"
              :current-page="productStore.pagination.currentPage" :total-pages="productStore.pagination.totalPages"
              @page-change="handlePageChange" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="px-4 py-12 text-center text-[var(--mada-muted)]">
      <p>{{ t('category.categoryNotFound') }}</p>
      <router-link to="/"
        class="mt-4 inline-block rounded-md bg-[var(--mada-primary)] px-6 py-3 text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t('common.backToHome') }}
      </router-link>
    </div>

    <div v-if="mobileFiltersOpen" class="fixed inset-0 z-40 lg:hidden">
      <button type="button" class="absolute inset-0 bg-black/40" @click="closeMobileFilters" />
      <div class="absolute bottom-0 top-0 w-full max-w-[22rem] overflow-y-auto bg-[var(--mada-surface)] p-4 shadow-xl"
        :class="mobileDrawerClass">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-lg font-semibold text-[var(--mada-dark)]">
            {{ t('category.filtersTitle') }}
          </p>
          <button type="button"
            class="rounded-md border border-[var(--mada-border)] px-2 py-1 text-xs font-semibold text-[var(--mada-dark)]"
            @click="closeMobileFilters">
            {{ t('category.closeFilters') }}
          </button>
        </div>
        <ProductFiltersSidebar :filters="activeFilters" :filter-options="productStore.filterOptions"
          :loading-options="productStore.filterOptionsLoading" @apply="applySidebarFilters" @clear="clearAllFilters" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/category'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useLocaleStore } from '@/stores/locale'
import CategoryCard from '@/components/CategoryCard.vue'
import ProductFiltersSidebar from '@/components/ProductFiltersSidebar.vue'
import ProductList from '@/components/ProductList.vue'
import Pagination from '@/components/Pagination.vue'

const ALLOWED_SORT_KEYS = new Set([
  'new_arrival',
  'popularity',
  'price_low_to_high',
  'price_high_to_low',
])

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const productStore = useProductStore()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const t = localeStore.t

const mobileFiltersOpen = ref(false)
const lastLoadedCategoryId = ref(null)

const categoryId = computed(() => {
  const parsed = Number.parseInt(String(route.params.id), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})

const activeFilters = computed(() => {
  return normalizeFiltersFromQuery(route.query)
})

const mobileDrawerClass = computed(() => {
  return localeStore.isArabic ? 'left-0' : 'right-0'
})

const childCategories = computed(() => {
  if (!categoryId.value) {
    return []
  }
  return categoryStore.getChildCategories(categoryId.value)
})

const activeFilterChips = computed(() => {
  const filters = activeFilters.value
  const chips = []

  if (filters.name) {
    chips.push({
      id: 'name',
      type: 'name',
      label: t('category.searchChip', { value: filters.name }),
    })
  }

  if (filters.min !== null) {
    chips.push({
      id: 'min',
      type: 'min',
      label: t('category.minPriceChip', { value: formatNumber(filters.min) }),
    })
  }

  if (filters.max !== null) {
    chips.push({
      id: 'max',
      type: 'max',
      label: t('category.maxPriceChip', { value: formatNumber(filters.max) }),
    })
  }

  if (filters.sortKey) {
    chips.push({
      id: 'sort',
      type: 'sort',
      label: t('category.sortChip', {
        value: getSortLabel(filters.sortKey),
      }),
    })
  }

  const categoriesById = new Map(
    [
      ...categoryStore.categories,
      ...(productStore.filterOptions?.categories || []),
    ]
      .filter((item) => item && item.id)
      .map((item) => [Number(item.id), item.name]),
  )

  filters.categories.forEach((categoryValue) => {
    chips.push({
      id: `category-${categoryValue}`,
      type: 'category',
      value: categoryValue,
      label: t('category.categoryChip', {
        value: categoriesById.get(categoryValue) || `#${categoryValue}`,
      }),
    })
  })

  const sellersById = new Map(
    (productStore.filterOptions?.sellers || [])
      .filter((seller) => seller && seller.id)
      .map((seller) => [Number(seller.id), seller.name]),
  )

  filters.sellers.forEach((sellerId) => {
    chips.push({
      id: `seller-${sellerId}`,
      type: 'seller',
      value: sellerId,
      label: t('category.sellerChip', {
        value: sellersById.get(sellerId) || `#${sellerId}`,
      }),
    })
  })

  const brandsById = new Map(
    (productStore.filterOptions?.brands || productStore.brands || [])
      .filter((brand) => brand && brand.id)
      .map((brand) => [Number(brand.id), brand.name]),
  )

  filters.brands.forEach((brandId) => {
    chips.push({
      id: `brand-${brandId}`,
      type: 'brand',
      value: brandId,
      label: t('category.brandChip', {
        value: brandsById.get(brandId) || `#${brandId}`,
      }),
    })
  })

  const attributeValuesByValue = new Map(
    (productStore.filterOptions?.attributes || [])
      .flatMap((attribute) => (Array.isArray(attribute.values) ? attribute.values : []))
      .map((value) => [String(value.value), value.label || String(value.value)]),
  )

  filters.attributeValues.forEach((attributeValue) => {
    chips.push({
      id: `attribute-${attributeValue}`,
      type: 'attribute',
      value: attributeValue,
      label: t('category.attributeChip', {
        value: attributeValuesByValue.get(attributeValue) || attributeValue,
      }),
    })
  })

  const filterAttributesById = new Map(
    (productStore.filterOptions?.filterAttributes || [])
      .filter((attribute) => attribute && attribute.id)
      .map((attribute) => [Number(attribute.id), attribute.name]),
  )

  filters.filterAttributes.forEach((filterAttributeId) => {
    chips.push({
      id: `filter-attribute-${filterAttributeId}`,
      type: 'filter-attribute',
      value: filterAttributeId,
      label: t('category.filterAttributeChip', {
        value: filterAttributesById.get(filterAttributeId) || `#${filterAttributeId}`,
      }),
    })
  })

  const colorsByCode = new Map(
    (productStore.filterOptions?.colors || [])
      .map((color) => [String(color.code ?? color.value ?? ''), color.name || String(color.code || '')]),
  )

  filters.colors.forEach((colorCode) => {
    chips.push({
      id: `color-${colorCode}`,
      type: 'color',
      value: colorCode,
      label: t('category.colorChip', {
        value: colorsByCode.get(colorCode) || colorCode,
      }),
    })
  })

  return chips
})

const hasAnyFilter = computed(() => activeFilterChips.value.length > 0)

const emptyProductsMessage = computed(() => {
  return hasAnyFilter.value ? t('category.noProductsForFilters') : ''
})

function normalizePositiveNumber(rawValue) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return null
  }
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }
  return parsed
}

function normalizePage(rawValue) {
  const parsed = Number.parseInt(String(rawValue || ''), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function normalizeIdList(rawValue) {
  const source = Array.isArray(rawValue)
    ? rawValue
    : typeof rawValue === 'string'
      ? rawValue.split(',')
      : []

  return Array.from(
    new Set(
      source
        .map((value) => Number.parseInt(String(value), 10))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  )
}

function normalizeStringList(rawValue) {
  const source = Array.isArray(rawValue)
    ? rawValue
    : typeof rawValue === 'string'
      ? rawValue.split(',')
      : []

  return Array.from(
    new Set(
      source
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  )
}

function normalizeFilters(filters = {}) {
  const normalized = {
    name: typeof filters.name === 'string' ? filters.name.trim() : '',
    min: normalizePositiveNumber(filters.min),
    max: normalizePositiveNumber(filters.max),
    categories: normalizeIdList(filters.categories),
    sellers: normalizeIdList(filters.sellers),
    brands: normalizeIdList(filters.brands),
    attributeValues: normalizeStringList(filters.attributeValues),
    filterAttributes: normalizeIdList(filters.filterAttributes),
    colors: normalizeStringList(filters.colors),
    sortKey:
      typeof filters.sortKey === 'string' && ALLOWED_SORT_KEYS.has(filters.sortKey)
        ? filters.sortKey
        : '',
    page: normalizePage(filters.page),
  }

  if (normalized.min !== null && normalized.max !== null && normalized.min > normalized.max) {
    const min = normalized.min
    normalized.min = normalized.max
    normalized.max = min
  }

  return normalized
}

function normalizeFiltersFromQuery(query) {
  return normalizeFilters({
    name:
      typeof query.name === 'string'
        ? query.name
        : typeof query.q === 'string'
          ? query.q
          : '',
    min: query.min,
    max: query.max,
    categories: query.categories ?? query.categories_ids,
    sellers: query.sellers ?? query.sellers_ids,
    brands: query.brands ?? query.brands_ids,
    attributeValues: query.attribute_values,
    filterAttributes: query.filter_attributes ?? query.filter_attributes_values,
    colors: query.colors ?? query.colors_ids,
    sortKey: query.sort_key,
    page: query.page,
  })
}

function serializeFiltersToQuery(filters) {
  const query = {}
  if (filters.name) {
    query.name = filters.name
  }
  if (filters.min !== null) {
    query.min = String(filters.min)
  }
  if (filters.max !== null) {
    query.max = String(filters.max)
  }
  if (filters.categories.length > 0) {
    query.categories = filters.categories.join(',')
  }
  if (filters.sellers.length > 0) {
    query.sellers = filters.sellers.join(',')
  }
  if (filters.brands.length > 0) {
    query.brands = filters.brands.join(',')
  }
  if (filters.attributeValues.length > 0) {
    query.attribute_values = filters.attributeValues.join(',')
  }
  if (filters.filterAttributes.length > 0) {
    query.filter_attributes = filters.filterAttributes.join(',')
  }
  if (filters.colors.length > 0) {
    query.colors = filters.colors.join(',')
  }
  if (filters.sortKey) {
    query.sort_key = filters.sortKey
  }
  if (filters.page > 1) {
    query.page = String(filters.page)
  }
  return query
}

function formatNumber(value) {
  return new Intl.NumberFormat(localeStore.locale).format(value)
}

function getSortLabel(sortKey) {
  if (sortKey === 'new_arrival') {
    return t('category.sortNewest')
  }
  if (sortKey === 'popularity') {
    return t('category.sortPopularity')
  }
  if (sortKey === 'price_low_to_high') {
    return t('category.sortPriceLowToHigh')
  }
  if (sortKey === 'price_high_to_low') {
    return t('category.sortPriceHighToLow')
  }
  return t('category.sortDefault')
}

function getDefaultContextCategoryIds() {
  if (!categoryId.value) {
    return []
  }

  return [categoryId.value, ...categoryStore.getDescendantIds(categoryId.value)]
}

function getEffectiveCategoryIds(filters) {
  return filters.categories.length > 0 ? filters.categories : getDefaultContextCategoryIds()
}

function buildSearchParams(filters, options = {}) {
  const { includePage = true, includeSort = true } = options
  const effectiveCategories = getEffectiveCategoryIds(filters)
  const params = {}

  if (effectiveCategories.length > 0) {
    const categoriesValue = effectiveCategories.join(',')
    params.categories = categoriesValue
    params.categories_ids = categoriesValue
  }

  if (filters.name) {
    params.name = filters.name
  }
  if (filters.min !== null) {
    params.min = filters.min
  }
  if (filters.max !== null) {
    params.max = filters.max
  }
  if (filters.sellers.length > 0) {
    params.sellers = filters.sellers.join(',')
    params.sellers_ids = filters.sellers.join(',')
  }
  if (filters.brands.length > 0) {
    params.brands = filters.brands.join(',')
    params.brands_ids = filters.brands.join(',')
  }
  if (filters.attributeValues.length > 0) {
    params.attribute_values = filters.attributeValues.join(',')
  }
  if (filters.filterAttributes.length > 0) {
    params.filter_attributes = filters.filterAttributes.join(',')
    params.filter_attributes_values = filters.filterAttributes.join(',')
  }
  if (filters.colors.length > 0) {
    params.colors = filters.colors.join(',')
    params.colors_ids = filters.colors.join(',')
  }
  if (includeSort && filters.sortKey) {
    params.sort_key = filters.sortKey
  }
  if (includePage) {
    params.page = filters.page
  }

  return params
}

function closeMobileFilters() {
  mobileFiltersOpen.value = false
}

function pushFilters(nextFilters) {
  if (!categoryId.value) {
    return
  }

  router.push({
    path: `/category/${categoryId.value}`,
    query: serializeFiltersToQuery(nextFilters),
  })
}

function applySidebarFilters(nextFilters) {
  const normalized = normalizeFilters({
    ...activeFilters.value,
    ...nextFilters,
    page: 1,
  })
  pushFilters(normalized)
  closeMobileFilters()
}

function clearAllFilters() {
  const normalized = normalizeFilters({
    page: 1,
  })
  pushFilters(normalized)
  closeMobileFilters()
}

function removeFilterChip(chip) {
  const nextFilters = {
    ...activeFilters.value,
    categories: [...activeFilters.value.categories],
    sellers: [...activeFilters.value.sellers],
    brands: [...activeFilters.value.brands],
    attributeValues: [...activeFilters.value.attributeValues],
    filterAttributes: [...activeFilters.value.filterAttributes],
    colors: [...activeFilters.value.colors],
    page: 1,
  }

  if (chip.type === 'name') {
    nextFilters.name = ''
  } else if (chip.type === 'min') {
    nextFilters.min = null
  } else if (chip.type === 'max') {
    nextFilters.max = null
  } else if (chip.type === 'sort') {
    nextFilters.sortKey = ''
  } else if (chip.type === 'category') {
    nextFilters.categories = nextFilters.categories.filter((id) => id !== chip.value)
  } else if (chip.type === 'seller') {
    nextFilters.sellers = nextFilters.sellers.filter((id) => id !== chip.value)
  } else if (chip.type === 'brand') {
    nextFilters.brands = nextFilters.brands.filter((id) => id !== chip.value)
  } else if (chip.type === 'attribute') {
    nextFilters.attributeValues = nextFilters.attributeValues.filter((value) => value !== chip.value)
  } else if (chip.type === 'filter-attribute') {
    nextFilters.filterAttributes = nextFilters.filterAttributes.filter((id) => id !== chip.value)
  } else if (chip.type === 'color') {
    nextFilters.colors = nextFilters.colors.filter((value) => value !== chip.value)
  }

  pushFilters(normalizeFilters(nextFilters))
}

async function handlePageChange(page) {
  const normalized = normalizeFilters({
    ...activeFilters.value,
    page,
  })
  pushFilters(normalized)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function ensureCategoryContextLoaded() {
  if (!categoryId.value) {
    categoryStore.currentCategory = null
    productStore.products = []
    productStore.searchResults = []
    return
  }

  if (!categoryStore.categories.length) {
    await categoryStore.fetchCategories()
  }

  if (
    lastLoadedCategoryId.value !== categoryId.value ||
    categoryStore.currentCategory?.id !== categoryId.value
  ) {
    await categoryStore.fetchCategoryById(categoryId.value)
    lastLoadedCategoryId.value = categoryId.value
  }
}

async function fetchFilteredProducts() {
  if (!categoryId.value) {
    return
  }

  const filters = activeFilters.value
  const params = buildSearchParams(filters, {
    includePage: true,
    includeSort: true,
  })

  productStore.setPage(filters.page)
  await productStore.searchProducts(params)
}

async function fetchFilterOptions() {
  const filters = activeFilters.value
  const params = buildSearchParams(filters, {
    includePage: false,
    includeSort: false,
  })
  await productStore.fetchFilterOptions(params)
}

async function loadData() {
  await ensureCategoryContextLoaded()
  await Promise.all([
    fetchFilteredProducts(),
    fetchFilterOptions(),
  ])
}

watch(
  () => route.fullPath,
  async () => {
    await loadData()
  },
  { immediate: true },
)

onMounted(async () => {
  if (!productStore.brands.length) {
    await productStore.fetchBrands()
  }
})
</script>
