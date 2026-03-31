<template>
    <div class="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
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
            <div class="flex flex-wrap items-center justify-between gap-3">
                <NuxtLink to="/orders"
                    class="inline-flex items-center rounded-lg border border-[var(--mada-border)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
                    ← {{ t('orders.title') }}
                </NuxtLink>

                <button type="button" @click="reloadOrder" :disabled="purchaseHistory.loading"
                    class="inline-flex items-center justify-center rounded-lg border border-[var(--mada-border)] bg-[var(--mada-soft)] px-4 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] disabled:cursor-not-allowed disabled:opacity-60">
                    {{ purchaseHistory.loading ? t('orders.refreshing') : t('orders.refresh') }}
                </button>
            </div>

            <div v-if="purchaseHistory.loading"
                class="rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-10 shadow-sm">
                <div class="flex items-center justify-center gap-3 text-[var(--mada-muted)]">
                    <div
                        class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mada-border)] border-t-[var(--mada-primary)]">
                    </div>
                    <p class="text-sm font-medium">{{ t('common.loading') }}</p>
                </div>
            </div>

            <div v-else-if="purchaseHistory.error"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ purchaseHistory.error }}
            </div>

            <section v-else-if="!order"
                class="rounded-2xl border border-[var(--mada-border)] bg-white px-6 py-10 text-center shadow-sm">
                <p class="text-lg font-semibold text-[var(--mada-dark)]">{{ t('orders.emptyTitle') }}</p>
                <p class="mt-2 text-sm text-[var(--mada-muted)]">{{ t('orders.emptyHint') }}</p>
                <NuxtLink to="/orders"
                    class="mt-6 inline-flex rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
                    {{ t('orders.title') }}
                </NuxtLink>
            </section>

            <article v-else-if="order"
                class="rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm md:p-6">
                <header class="rounded-2xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-5">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-[var(--mada-dark)] md:text-3xl">
                                {{ t('orders.orderLabel') }} #{{ order.id }}
                            </h1>
                            <p class="mt-2 text-sm text-[var(--mada-muted)]">
                                {{ t('orders.createdAt') }}: {{ formatDate(order.createdAt) }}
                            </p>
                        </div>

                        <span :class="getStatusBadgeClass(order.status)"
                            class="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold">
                            {{ formatStatus(order.status) }}
                        </span>
                    </div>
                </header>

                <div class="mt-5 grid gap-4 sm:grid-cols-3">
                    <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                            t('orders.status') }}</p>
                        <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ formatStatus(order.status) }}
                        </p>
                    </div>
                    <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                            t('orders.total') }}</p>
                        <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ formatOrderTotal(order) }}</p>
                    </div>
                    <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">{{
                            t('orders.items') }}</p>
                        <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ orderItemsCount(order) }}</p>
                    </div>
                </div>

                <section class="mt-6 border-t border-[var(--mada-border)] pt-6">
                    <h2 class="text-lg font-bold text-[var(--mada-dark)]">Order Information</h2>
                    <div class="mt-4 grid gap-4 md:grid-cols-2">
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">Store
                                Code</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.store_code || '-' }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Payment Type</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.payment_type || '-'
                                }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Payment Status</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.payment_status_string
                                || order.payment_status || '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Delivery Status</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{
                                order.delivery_status_string || order.delivery_status || '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">Paid
                            </p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.paid || '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Remaining</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.remaining || '-' }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Subtotal</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.subtotal || '-' }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Shipping Cost</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.shipping_cost || '-'
                                }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Special Discount</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ order.special_discount ||
                                '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Shipping ETA</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{
                                order.shipping_estimated_time || '-' }}</p>
                        </div>
                    </div>
                </section>

                <section v-if="shippingAddress" class="mt-6 border-t border-[var(--mada-border)] pt-6">
                    <h2 class="text-lg font-bold text-[var(--mada-dark)]">Shipping Address</h2>
                    <div class="mt-4 grid gap-4 md:grid-cols-2">
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">Name
                            </p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.name || '-'
                                }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">Phone
                            </p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.phone ||
                                '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4 md:col-span-2">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Address</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.address ||
                                '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">City
                            </p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.city || '-'
                                }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">State
                            </p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.state ||
                                '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">
                                Country</p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.country ||
                                '-' }}</p>
                        </div>
                        <div class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mada-muted)]">Email
                            </p>
                            <p class="mt-1 text-sm font-semibold text-[var(--mada-dark)]">{{ shippingAddress.email ||
                                '-' }}</p>
                        </div>
                    </div>
                </section>

                <section class="mt-6 border-t border-[var(--mada-border)] pt-6">
                    <h2 class="text-lg font-bold text-[var(--mada-dark)]">Order Items</h2>

                    <div v-if="purchaseHistory.currentOrderItems.length === 0"
                        class="mt-4 rounded-xl border border-[var(--mada-border)] bg-white px-4 py-6 text-sm text-[var(--mada-muted)]">
                        No items found for this order.
                    </div>

                    <div v-else class="mt-4 grid gap-3">
                        <article v-for="item in purchaseHistory.currentOrderItems" :key="item.id"
                            class="rounded-xl border border-[var(--mada-border)] bg-white p-4">
                            <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-semibold text-[var(--mada-dark)]">{{ item.name ||
                                        '-' }}</p>
                                    <p class="mt-1 text-xs text-[var(--mada-muted)]">SKU: {{ item.sku || '-' }}</p>
                                </div>
                                <p class="text-sm font-semibold text-[var(--mada-dark)]">
                                    Qty: {{ item.quantity || 1 }}
                                </p>
                                <p class="text-sm font-semibold text-[var(--mada-dark)]">{{ formatTotal(item.price) }}
                                </p>
                            </div>
                            <div v-if="item.total" class="mt-3 border-t border-[var(--mada-border)] pt-3">
                                <p class="text-xs text-[var(--mada-muted)]">
                                    Line Total: <span class="font-semibold text-[var(--mada-dark)]">{{
                                        formatTotal(item.total) }}</span>
                                </p>
                            </div>
                        </article>
                    </div>
                </section>
            </article>
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

const route = useRoute()
const auth = useAuthStore()
const localeStore = useLocaleStore()
const purchaseHistory = usePurchaseHistoryStore()
const t = localeStore.t

const orderId = computed(() => route.params.id)
const order = computed(() => purchaseHistory.currentOrder)
const localeCode = computed(() => (localeStore.locale === 'en' ? 'en-US' : 'ar-EG'))
const shippingAddress = computed(() => order.value?.shipping_address || null)

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

function formatOrderTotal(currentOrder) {
    const numericTotal = Number(currentOrder?.totalAmount)
    if (Number.isFinite(numericTotal)) {
        return numericTotal.toLocaleString(localeCode.value)
    }

    if (currentOrder?.total !== null && currentOrder?.total !== undefined && currentOrder?.total !== '') {
        return formatTotal(currentOrder.total)
    }

    return '-'
}

function orderItemsCount(currentOrder) {
    const fromCountField = Number(currentOrder?.itemsCount ?? currentOrder?.items_count ?? currentOrder?.orders_count)
    if (Number.isFinite(fromCountField) && fromCountField > 0) {
        return fromCountField
    }

    if (!Array.isArray(currentOrder?.items)) {
        return 0
    }

    return currentOrder.items.reduce((total, item) => {
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

async function reloadOrder() {
    if (!orderId.value) {
        return
    }

    try {
        await purchaseHistory.fetchOrderById(orderId.value)
        await purchaseHistory.fetchOrderItems(orderId.value)
    } catch { }
}

onMounted(async () => {
    if (!auth.isAuthenticated || !orderId.value) {
        return
    }

    await reloadOrder()
})

useHead(() => ({
    title: `${t('orders.orderLabel')} #${String(orderId.value || '')} — ${t('app.siteName')}`,
}))
</script>
