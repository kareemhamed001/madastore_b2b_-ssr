<template>
  <article
    class="group relative overflow-hidden rounded-2xl border border-[var(--mada-border)] bg-white/95 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    :style="{ marginInlineStart: `${depth * 16}px` }">
    <span v-if="depth > 0"
      class="pointer-events-none absolute inset-y-0 start-0 w-1 rounded-e bg-[linear-gradient(180deg,#b4dcff_0%,#60b6ff_100%)]"></span>

    <div class="flex items-center gap-3 px-4 py-4 md:gap-4 md:px-5">
      <button v-if="isExpandable" type="button"
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--mada-border)] bg-[var(--mada-soft)] text-[var(--mada-dark)] transition hover:scale-105 hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]"
        :aria-expanded="isExpanded" :aria-label="t('categoryAccordion.toggleCategory', { name: category.name })"
        @click="toggleCategory">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition"
          :class="isExpanded ? 'rotate-180' : ''">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <span v-else class="inline-flex h-9 w-9 shrink-0"></span>

      <div
        class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)]">
        <img v-if="category.banner || category.icon || category.image"
          :src="category.banner || category.icon || category.image" :alt="category.name"
          class="h-full w-full object-cover" loading="lazy" />
      </div>

      <button v-if="isExpandable" type="button" class="flex-1 text-left" @click="toggleCategory">
        <h3 class="text-base font-bold text-[var(--mada-dark)] md:text-lg">
          {{ category.name }}
        </h3>
        <p class="mt-0.5 text-sm font-medium text-[var(--mada-muted)]">
          {{ t('categoryAccordion.subCategoriesCount', { count: declaredChildrenCount }) }}
        </p>
      </button>

      <NuxtLink v-else :to="`/category/${category.id}`"
        class="flex-1 text-left transition hover:text-[var(--mada-primary)]">
        <h3 class="text-base font-bold text-[var(--mada-dark)] md:text-lg">
          {{ category.name }}
        </h3>
      </NuxtLink>

      <NuxtLink :to="`/category/${category.id}`"
        class="rounded-full border border-[var(--mada-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
        {{ t('common.view') }}
      </NuxtLink>
    </div>

    <div v-if="isExpandable" class="overflow-hidden px-4 transition-all duration-500 ease-out md:px-5"
      :class="isExpanded ? 'max-h-[1400px] pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'">
      <div v-if="categoryStore.subCategoryLoading[category.id]"
        class="rounded-xl bg-[var(--mada-soft)] px-4 py-3 text-sm text-[var(--mada-muted)]">
        {{ t('categoryAccordion.loadingSubCategories') }}
      </div>

      <div v-else-if="children.length === 0"
        class="rounded-xl bg-[var(--mada-soft)] px-4 py-3 text-sm text-[var(--mada-muted)]">
        {{ t('categoryAccordion.noSubCategories') }}
      </div>

      <div v-else class="space-y-3 pt-1">
        <CategoryAccordionItem v-for="child in children" :key="child.id" :category="child" :depth="depth + 1" />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";
import { useCategoryStore } from "@/stores/category";
import { useLocaleStore } from "@/stores/locale";

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
});

const categoryStore = useCategoryStore();
const localeStore = useLocaleStore();
const t = localeStore.t;
const isExpanded = ref(false);

const children = computed(() => {
  const directChildren = Array.isArray(props.category.children)
    ? props.category.children
    : [];
  const list = directChildren.length
    ? directChildren
    : categoryStore.subCategoriesById[props.category.id] || [];
  return list.filter((item) => item && item.id);
});

const declaredChildrenCount = computed(() => {
  const candidates = [
    children.value.length,
    props.category.number_of_children,
    props.category.children_count,
    props.category.total_children,
  ];
  const count = candidates.find((value) => Number.isFinite(Number(value)));
  return Number(count || 0);
});

const hasLoadedChildren = computed(() => children.value.length > 0);

const isExpandable = computed(() => {
  return declaredChildrenCount.value > 0 || hasLoadedChildren.value;
});

async function toggleCategory() {
  if (!isExpandable.value) {
    return;
  }

  isExpanded.value = !isExpanded.value;
  if (isExpanded.value && children.value.length === 0) {
    await categoryStore.fetchSubCategories(props.category.id);
  }
}
</script>
