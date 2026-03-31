<template>
    <NuxtPage v-if="hasChildRoute" />

    <div v-else class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <div v-if="!auth.isAuthenticated"
            class="rounded-2xl border border-[var(--mada-border)] bg-white px-6 py-10 text-center shadow-sm md:px-10">
            <h1 class="text-2xl font-bold text-[var(--mada-dark)] md:text-3xl">{{ t('orders.title') }}</h1>
            <p class="mt-3 text-sm text-[var(--mada-muted)] md:text-base">
                {{ t('orders.loginRequired') }}
            </p>
            <NuxtLink to="/login"
                class="mt-6 inline-flex rounded-xl bg-[var(--mada-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
                {{ t('orders.goToLogin') }}
            </NuxtLink>
        </div>

        <div v-else class="space-y-6">
            <header class="rounded-3xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:p-7">
                <div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">{{ t('orders.title') }}</h1>
                        <p class="mt-2 text-sm text-[var(--mada-muted)] md:text-base">
                            {{ t('orders.subtitle') }}
                        </p>
                    </div>

                    <button type="button" @click="refreshOrders" :disabled="purchaseHistory.loading"
                        class="inline-flex items-center justify-center rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] disabled:cursor-not-allowed disabled:opacity-60">
                        {{ purchaseHistory.loading ? t('orders.refreshing') : t('orders.refresh') }}
                    </button>
                </div>

                <div class="mt-5 grid gap-3 sm:grid-cols-3">
                    <div class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                            t('orders.title') }}</p>
                        <p class="mt-2 text-xl font-bold text-[var(--mada-dark)]">{{ purchaseHistory.totalOrders }}</p>
                    </div>
                    <div class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                            t('orders.statusPending') }}</p>
                        <p class="mt-2 text-xl font-bold text-[var(--mada-dark)]">{{
                            purchaseHistory.pendingOrders.length }}</p>
                    </div>
                    <div class="rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                            t('orders.statusCompleted') }}</p>
                        <p class="mt-2 text-xl font-bold text-[var(--mada-dark)]">{{
                            purchaseHistory.completedOrders.length }}</p>
                    </div>
                </div>
            </header>

            <div v-if="purchaseHistory.error" role="alert"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ purchaseHistory.error || t('orders.loadFailed') }}
            </div>

            <div v-if="purchaseHistory.loading && !purchaseHistory.hasOrders"
                class="rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-10 shadow-sm">
                <div class="flex items-center justify-center gap-3 text-[var(--mada-muted)]">
                    <div
                        class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mada-border)] border-t-[var(--mada-primary)]">
                    </div>
                    <p class="text-sm font-medium">{{ t('common.loading') }}</p>
                </div>
            </div>

            <section v-else-if="purchaseHistory.hasOrders" class="grid grid-cols-1 gap-4">
                <article v-for="order in purchaseHistory.allOrders" :key="order.id"
                    class="rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm transition hover:border-[var(--mada-primary)]/40 md:p-6">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                {{ t('orders.orderLabel') }} #{{ order.id }}
                            </p>
                            <p class="mt-2 text-sm text-[var(--mada-muted)]">
                                {{ t('orders.createdAt') }}: {{ formatDate(order.createdAt) }}
                            </p>
                        </div>

                        <span :class="getStatusBadgeClass(order.status)"
                            class="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold">
                            {{ formatStatus(order.status) }}
                        </span>
                    </div>

                    <div class="mt-4 grid gap-3 border-t border-[var(--mada-border)] pt-4 sm:grid-cols-3">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                                t('orders.items') }}</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ orderItemsCount(order) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                                t('orders.total') }}</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ formatOrderTotal(order) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                                t('orders.status') }}</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ formatStatus(order.status)
                            }}</p>
                        </div>
                    </div>

                    <div class="mt-4 border-t border-[var(--mada-border)] pt-4">
                        <NuxtLink :to="`/orders/${order.id}`"
                            class="inline-flex items-center justify-center rounded-lg border border-[var(--mada-border)] bg-[var(--mada-soft)] px-4 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
                            {{ t('common.view') }}
                        </NuxtLink>
                    </div>
                </article>
            </section>

            <section v-else
                class="rounded-2xl border border-[var(--mada-border)] bg-white px-6 py-10 text-center shadow-sm">
                <p class="text-lg font-semibold text-[var(--mada-dark)]">
                    {{ t('orders.emptyTitle') }}
                </p>
                <p class="mt-2 text-sm text-[var(--mada-muted)]">
                    {{ t('orders.emptyHint') }}
                </p>
                <NuxtLink to="/"
                    class="mt-6 inline-flex rounded-xl bg-[var(--mada-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
                    {{ t('orders.startShopping') }}
                </NuxtLink>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { usePurchaseHistoryStore } from '@/stores/purchaseHistory'

definePageMeta({
    requiresAuth: true,
})

const auth = useAuthStore()
const route = useRoute()
const localeStore = useLocaleStore()
const purchaseHistory = usePurchaseHistoryStore()
const t = localeStore.t

const localeCode = computed(() => localeStore.locale === 'en' ? 'en-US' : 'ar-EG')
const hasChildRoute = computed(() => Boolean(route.params.id))

function formatDate(value) {
    if (!value) {
        return '-'
    }

    if (typeof value === 'string') {
        const normalized = value.trim()
        const match = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

        if (match) {
            const day = Number(match[1])
            const month = Number(match[2])
            const year = Number(match[3])
            let hour = Number(match[4])
            const minute = Number(match[5])
            const meridiem = String(match[6]).toUpperCase()

            if (meridiem === 'PM' && hour < 12) {
                hour += 12
            }
            if (meridiem === 'AM' && hour === 12) {
                hour = 0
            }

            const parsed = new Date(year, month - 1, day, hour, minute)
            if (!Number.isNaN(parsed.getTime())) {
                return parsed.toLocaleString(localeCode.value)
            }
        }
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return String(value)
    }

    return date.toLocaleString(localeCode.value)
}

function formatTotal(value) {
    const amount = Number(value)
    if (Number.isFinite(amount)) {
        return amount.toLocaleString(localeCode.value)
    }

    if (typeof value === 'string') {
        const cleaned = value.replace(/,/g, '')
        const match = cleaned.match(/-?\d+(?:\.\d+)?/)
        if (match) {
            const parsed = Number(match[0])
            if (Number.isFinite(parsed)) {
                return parsed.toLocaleString(localeCode.value)
            }
        }
    }

    if (typeof value === 'string' && value.trim()) {
        return value
    }

    return '-'
}

function formatOrderTotal(order) {
    const numericTotal = Number(order?.totalAmount)
    if (Number.isFinite(numericTotal)) {
        return numericTotal.toLocaleString(localeCode.value)
    }

    if (order?.total !== null && order?.total !== undefined && order?.total !== '') {
        return formatTotal(order.total)
    }

    return '-'
}

function orderItemsCount(order) {
    const fromCountField = Number(order?.itemsCount ?? order?.items_count ?? order?.orders_count)
    if (Number.isFinite(fromCountField) && fromCountField > 0) {
        return fromCountField
    }

    if (!Array.isArray(order?.items)) {
        return 0
    }

    return order.items.reduce((total, item) => {
        const quantity = Number(item?.quantity ?? item?.qty ?? 1)
        return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
    }, 0)
}

function formatStatus(status) {
    if (status === 'pending') {
        return t('orders.statusPending')
    }
    if (status === 'completed') {
        return t('orders.statusCompleted')
    }
    if (status === 'rejected') {
        return t('orders.statusRejected')
    }
    return t('orders.statusUnknown')
}

function getStatusBadgeClass(status) {
    if (status === 'pending') {
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    }
    if (status === 'completed') {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
    if (status === 'rejected') {
        return 'bg-red-50 text-red-700 border border-red-200'
    }
    return 'bg-gray-100 text-gray-700 border border-gray-200'
}

async function refreshOrders() {
    try {
        await purchaseHistory.refreshOrders()
    } catch { }
}

onMounted(async () => {
    if (!auth.isAuthenticated || hasChildRoute.value) {
        return
    }

    try {
        await purchaseHistory.fetchOrders()
    } catch { }
})

useHead(() => ({
    title: `${t('orders.title')} — ${t('app.siteName')}`,
}))
</script>
