<template>
  <section class="mx-auto w-full max-w-md px-4 py-12">
    <div class="overflow-hidden rounded-3xl border border-[var(--mada-border)] bg-white shadow-sm">
      <div class="bg-[linear-gradient(130deg,#eaf6ff_0%,#f8fcff_100%)] px-6 py-7">
        <h1 class="text-2xl font-bold text-[var(--mada-dark)]">{{ t('auth.signIn') }}</h1>
        <p class="mt-1 text-sm text-[var(--mada-muted)]">
          {{ t('auth.signInSubtitle') }}
        </p>
      </div>

      <form class="space-y-4 px-6 py-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.email') }}
          </label>
          <input id="email" v-model.trim="form.email" type="text" required autocomplete="email"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.emailPlaceholder')" />
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.password') }}
          </label>
          <input id="password" v-model="form.password" type="password" required autocomplete="current-password"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.passwordPlaceholder')" />
        </div>

        <p v-if="submitError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ submitError }}
        </p>

        <button type="submit" :disabled="authStore.loading"
          class="w-full rounded-xl bg-[var(--mada-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70">
          {{ authStore.loading ? t('auth.signingIn') : t('auth.signIn') }}
        </button>

        <p class="text-center text-sm text-[var(--mada-muted)]">
          {{ t('auth.noAccount') }}
          <RouterLink :to="{ path: '/register', query: redirectQuery }"
            class="font-semibold text-[var(--mada-primary)] hover:underline">
            {{ t('auth.createOne') }}
          </RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/stores/locale";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const t = localeStore.t;

const form = reactive({
  email: "",
  password: "",
});
const submitError = ref("");

const redirectTo = computed(() => String(route.query.redirect || "/"));
const redirectQuery = computed(() =>
  route.query.redirect ? { redirect: route.query.redirect } : {},
);

async function handleSubmit() {
  submitError.value = "";
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });
    await router.push(redirectTo.value);
  } catch (error) {
    submitError.value = error?.message || t('auth.unableSignIn');
  }
}
</script>
