<template>
  <form
    class="rounded-2xl border border-[var(--mada-border)] bg-white p-4 shadow-sm"
    @submit.prevent="handleApply"
  >
    <div class="mb-4 flex items-center justify-between gap-3">
      <h3 class="text-lg font-semibold text-[var(--mada-dark)]">
        {{ t('category.filtersTitle') }}
      </h3>
      <button
        type="button"
        class="text-xs font-semibold text-[var(--mada-primary)] transition hover:text-[var(--mada-primary-hover)]"
        @click="handleClear"
      >
        {{ t('category.clearAllFilters') }}
      </button>
    </div>

    <button
      type="submit"
      class="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--mada-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]"
    >
      <span>{{ t('category.applyFilters') }}</span>
    </button>

    <div class="space-y-3">
      <details open class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.filterNameLabel') }}
        </summary>
        <div class="p-3">
          <input
            id="filters-name"
            v-model.trim="localFilters.name"
            type="search"
            :placeholder="t('category.filterNamePlaceholder')"
            class="w-full rounded-lg border border-[var(--mada-border)] bg-white px-3 py-2 text-sm text-[var(--mada-dark)] outline-none transition focus:border-[var(--mada-primary)]"
          />
        </div>
      </details>

      <details open class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.sortByLabel') }}
        </summary>
        <div class="p-3">
          <select
            id="filters-sort"
            v-model="localFilters.sortKey"
            class="w-full rounded-lg border border-[var(--mada-border)] bg-white px-3 py-2 text-sm text-[var(--mada-dark)] outline-none transition focus:border-[var(--mada-primary)]"
          >
            <option value="">{{ t('category.sortDefault') }}</option>
            <option value="new_arrival">{{ t('category.sortNewest') }}</option>
            <option value="popularity">{{ t('category.sortPopularity') }}</option>
            <option value="price_low_to_high">
              {{ t('category.sortPriceLowToHigh') }}
            </option>
            <option value="price_high_to_low">
              {{ t('category.sortPriceHighToLow') }}
            </option>
          </select>
        </div>
      </details>

      <details open class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.priceRangeTitle') }}
        </summary>
        <div class="grid grid-cols-2 gap-3 p-3">
          <div>
            <label
              for="filters-min"
              class="mb-1.5 block text-xs font-medium text-[var(--mada-dark)]"
            >
              {{ t('category.minPriceLabel') }}
            </label>
            <input
              id="filters-min"
              v-model="localFilters.min"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-lg border border-[var(--mada-border)] bg-white px-3 py-2 text-sm text-[var(--mada-dark)] outline-none transition focus:border-[var(--mada-primary)]"
            />
          </div>
          <div>
            <label
              for="filters-max"
              class="mb-1.5 block text-xs font-medium text-[var(--mada-dark)]"
            >
              {{ t('category.maxPriceLabel') }}
            </label>
            <input
              id="filters-max"
              v-model="localFilters.max"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-lg border border-[var(--mada-border)] bg-white px-3 py-2 text-sm text-[var(--mada-dark)] outline-none transition focus:border-[var(--mada-primary)]"
            />
          </div>
        </div>
      </details>

      <details v-if="hasCategoriesSection" class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.filterCategoriesLabel') }}
        </summary>
        <div class="p-3">
          <div class="max-h-60 space-y-2 overflow-y-auto">
            <label
              v-for="category in categoryOptions"
              :key="`category-option-${category.id}`"
              class="flex cursor-pointer items-center gap-2 text-sm text-[var(--mada-dark)]"
            >
              <input
                v-model="localCategoryIds"
                type="checkbox"
                :value="String(category.id)"
                class="h-4 w-4 rounded border-[var(--mada-border)] text-[var(--mada-primary)]"
              />
              <span class="truncate">{{ category.name }}</span>
            </label>
          </div>
        </div>
      </details>

      <details v-if="hasSellersSection" class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.filterSellersLabel') }}
        </summary>
        <div class="p-3">
          <div class="max-h-60 space-y-2 overflow-y-auto">
            <label
              v-for="seller in sellerOptions"
              :key="`seller-option-${seller.id}`"
              class="flex cursor-pointer items-center gap-2 text-sm text-[var(--mada-dark)]"
            >
              <input
                v-model="localSellerIds"
                type="checkbox"
                :value="String(seller.id)"
                class="h-4 w-4 rounded border-[var(--mada-border)] text-[var(--mada-primary)]"
              />
              <span class="truncate">{{ seller.name }}</span>
            </label>
          </div>
        </div>
      </details>

      <details v-if="hasBrandsSection" class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.brandLabel') }}
        </summary>
        <div class="p-3">
          <div class="max-h-60 space-y-2 overflow-y-auto">
            <label
              v-for="brand in brandOptions"
              :key="`brand-option-${brand.id}`"
              class="flex cursor-pointer items-center gap-2 text-sm text-[var(--mada-dark)]"
            >
              <input
                v-model="localBrandIds"
                type="checkbox"
                :value="String(brand.id)"
                class="h-4 w-4 rounded border-[var(--mada-border)] text-[var(--mada-primary)]"
              />
              <span class="truncate">{{ brand.name }}</span>
            </label>
          </div>
        </div>
      </details>

      <details v-if="hasAttributesSection" class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.filterAttributesLabel') }}
        </summary>
        <div class="p-3">
          <div class="space-y-3">
            <details
              v-for="attribute in attributeOptionsWithValues"
              :key="`attribute-group-${attribute.id}`"
              class="overflow-hidden rounded-lg border border-[var(--mada-border)]"
            >
              <summary class="cursor-pointer bg-white px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
                {{ attribute.name }}
              </summary>
              <div class="max-h-52 space-y-2 overflow-y-auto p-3">
                <label
                  v-for="value in attribute.values"
                  :key="`attribute-value-${attribute.id}-${value.value}`"
                  class="flex cursor-pointer items-center gap-2 text-sm text-[var(--mada-dark)]"
                >
                  <input
                    v-model="localAttributeValues"
                    type="checkbox"
                    :value="value.value"
                    class="h-4 w-4 rounded border-[var(--mada-border)] text-[var(--mada-primary)]"
                  />
                  <span class="truncate">{{ value.label }}</span>
                </label>
              </div>
            </details>
          </div>
        </div>
      </details>

      <details
        v-if="hasFilterAttributesSection"
        class="overflow-hidden rounded-xl border border-[var(--mada-border)]"
      >
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.filterAdditionalAttributesLabel') }}
        </summary>
        <div class="p-3">
          <div class="max-h-60 space-y-2 overflow-y-auto">
            <label
              v-for="attribute in filterAttributeOptions"
              :key="`filter-attribute-option-${attribute.id}`"
              class="flex cursor-pointer items-center gap-2 text-sm text-[var(--mada-dark)]"
            >
              <input
                v-model="localFilterAttributeIds"
                type="checkbox"
                :value="String(attribute.id)"
                class="h-4 w-4 rounded border-[var(--mada-border)] text-[var(--mada-primary)]"
              />
              <span class="truncate">{{ attribute.name }}</span>
            </label>
          </div>
        </div>
      </details>

      <details v-if="hasColorsSection" class="overflow-hidden rounded-xl border border-[var(--mada-border)]">
        <summary class="cursor-pointer bg-[var(--mada-soft)] px-3 py-2 text-sm font-semibold text-[var(--mada-dark)]">
          {{ t('category.filterColorsLabel') }}
        </summary>
        <div class="p-3">
          <div class="grid grid-cols-4 gap-2">
            <label
              v-for="color in colorOptions"
              :key="`color-option-${color.code}`"
              class="cursor-pointer"
            >
              <input
                v-model="localColorCodes"
                type="checkbox"
                :value="color.code"
                class="sr-only"
              />
              <span
                class="block h-7 w-7 rounded-full border-2 transition"
                :style="{ background: color.code }"
                :class="localColorCodes.includes(color.code) ? 'border-[var(--mada-primary)] ring-2 ring-[var(--mada-primary)]/25' : 'border-white shadow-sm ring-1 ring-black/10'"
                :title="color.name"
              />
            </label>
          </div>
        </div>
      </details>
    </div>

    <button
      type="submit"
      class="mt-4 w-full rounded-lg bg-[var(--mada-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]"
    >
      {{ t('category.applyFilters') }}
    </button>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  filterOptions: {
    type: Object,
    default: () => ({}),
  },
  loadingOptions: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['apply', 'clear'])

const localeStore = useLocaleStore()
const t = localeStore.t

const localFilters = ref({
  name: '',
  min: '',
  max: '',
  sortKey: '',
})

const localCategoryIds = ref([])
const localSellerIds = ref([])
const localBrandIds = ref([])
const localAttributeValues = ref([])
const localFilterAttributeIds = ref([])
const localColorCodes = ref([])

const categoryOptions = computed(() => normalizeOptionList(props.filterOptions?.categories))
const sellerOptions = computed(() => normalizeOptionList(props.filterOptions?.sellers))
const brandOptions = computed(() => normalizeOptionList(props.filterOptions?.brands))
const attributeOptions = computed(() => normalizeAttributeOptions(props.filterOptions?.attributes))
const filterAttributeOptions = computed(() =>
  normalizeOptionList(props.filterOptions?.filterAttributes),
)
const colorOptions = computed(() =>
  normalizeOptionList(props.filterOptions?.colors)
    .map((item) => ({
      ...item,
      code: String(item.code ?? item.value ?? '').trim(),
    }))
    .filter((item) => item.code),
)

const attributeOptionsWithValues = computed(() =>
  attributeOptions.value.filter((attribute) => Array.isArray(attribute.values) && attribute.values.length > 0),
)

const hasCategoriesSection = computed(() => categoryOptions.value.length > 0)
const hasSellersSection = computed(() => sellerOptions.value.length > 0)
const hasBrandsSection = computed(() => brandOptions.value.length > 0)
const hasAttributesSection = computed(() => attributeOptionsWithValues.value.length > 0)
const hasFilterAttributesSection = computed(() => filterAttributeOptions.value.length > 0)
const hasColorsSection = computed(() => colorOptions.value.length > 0)

function parseNullableNumber(rawValue) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return null
  }

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }
  return parsed
}

function normalizeOptionList(source) {
  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const id = item.id ?? item.value ?? item.code
      const name = item.name ?? item.label ?? item.value ?? item.code
      if (id === null || id === undefined || !String(name || '').trim()) {
        return null
      }

      return {
        ...item,
        id,
        name: String(name).trim(),
      }
    })
    .filter(Boolean)
}

function normalizeAttributeOptions(source) {
  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((attribute) => {
      if (!attribute || typeof attribute !== 'object') {
        return null
      }

      const id = attribute.id ?? attribute.code
      const name = attribute.name ?? attribute.label
      if (id === null || id === undefined || !String(name || '').trim()) {
        return null
      }

      const valuesSource = Array.isArray(attribute.values)
        ? attribute.values
        : Array.isArray(attribute.attribute_values)
          ? attribute.attribute_values
          : []

      const values = valuesSource
        .map((item) => {
          if (item && typeof item === 'object') {
            const value = item.value ?? item.id ?? item.code
            const label = item.label ?? item.name ?? item.value
            if (value === null || value === undefined || !String(label || '').trim()) {
              return null
            }
            return {
              value: String(value),
              label: String(label).trim(),
            }
          }

          if (item === null || item === undefined) {
            return null
          }

          const normalized = String(item).trim()
          if (!normalized) {
            return null
          }

          return {
            value: normalized,
            label: normalized,
          }
        })
        .filter(Boolean)

      return {
        id,
        name: String(name).trim(),
        values,
      }
    })
    .filter(Boolean)
}

function normalizeIds(rawValue) {
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

function syncLocalFilters(filters) {
  localFilters.value = {
    name: typeof filters?.name === 'string' ? filters.name : '',
    min: filters?.min !== null && filters?.min !== undefined ? String(filters.min) : '',
    max: filters?.max !== null && filters?.max !== undefined ? String(filters.max) : '',
    sortKey: typeof filters?.sortKey === 'string' ? filters.sortKey : '',
  }

  localCategoryIds.value = normalizeIds(filters?.categories).map((id) => String(id))
  localSellerIds.value = normalizeIds(filters?.sellers).map((id) => String(id))
  localBrandIds.value = normalizeIds(filters?.brands).map((id) => String(id))
  localAttributeValues.value = normalizeStringList(filters?.attributeValues)
  localFilterAttributeIds.value = normalizeIds(filters?.filterAttributes).map((id) =>
    String(id),
  )
  localColorCodes.value = normalizeStringList(filters?.colors)
}

function handleApply() {
  emit('apply', {
    name: localFilters.value.name.trim(),
    min: parseNullableNumber(localFilters.value.min),
    max: parseNullableNumber(localFilters.value.max),
    sortKey: localFilters.value.sortKey,
    categories: normalizeIds(localCategoryIds.value),
    sellers: normalizeIds(localSellerIds.value),
    brands: normalizeIds(localBrandIds.value),
    attributeValues: normalizeStringList(localAttributeValues.value),
    filterAttributes: normalizeIds(localFilterAttributeIds.value),
    colors: normalizeStringList(localColorCodes.value),
  })
}

function handleClear() {
  syncLocalFilters({
    name: '',
    min: null,
    max: null,
    sortKey: '',
    categories: [],
    sellers: [],
    brands: [],
    attributeValues: [],
    filterAttributes: [],
    colors: [],
  })
  emit('clear')
}

watch(
  () => props.filters,
  (value) => {
    syncLocalFilters(value)
  },
  { immediate: true, deep: true },
)
</script>
