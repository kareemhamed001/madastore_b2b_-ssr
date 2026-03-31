<template>
  <section class="mx-auto w-full max-w-lg px-4 py-12">
    <div class="overflow-hidden rounded-3xl border border-[var(--mada-border)] bg-white shadow-sm">
      <div class="bg-[linear-gradient(130deg,#eaf6ff_0%,#f8fcff_100%)] px-6 py-7">
        <h1 class="text-2xl font-bold text-[var(--mada-dark)]">{{ t('auth.createAccount') }}</h1>
        <p class="mt-1 text-sm text-[var(--mada-muted)]">
          {{ t('auth.registerSubtitle') }}
        </p>
      </div>

      <form class="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2" @submit.prevent="handleSubmit">
        <div class="md:col-span-1">
          <label for="name" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.fullName') }}
          </label>
          <input id="name" v-model.trim="form.name" type="text" required autocomplete="name"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.fullNamePlaceholder')" />
        </div>

        <div class="md:col-span-1">
          <label for="phone" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.phone') }}
          </label>
          <input id="phone" v-model.trim="form.phone" type="tel" autocomplete="tel"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.phonePlaceholder')" />
        </div>

        <div class="md:col-span-2">
          <label for="email" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.email') }}
          </label>
          <input id="email" v-model.trim="form.email" type="email" required autocomplete="email"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.emailPlaceholder')" />
        </div>

        <div class="md:col-span-1">
          <label for="password" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.password') }}
          </label>
          <input id="password" v-model="form.password" type="password" required minlength="6"
            autocomplete="new-password"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.passwordMinPlaceholder')" />
        </div>

        <div class="md:col-span-1">
          <label for="password-confirmation" class="mb-1 block text-sm font-semibold text-[var(--mada-dark)]">
            {{ t('auth.confirmPassword') }}
          </label>
          <input id="password-confirmation" v-model="form.passwordConfirmation" type="password" required minlength="6"
            autocomplete="new-password"
            class="w-full rounded-xl border border-[var(--mada-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--mada-primary)]"
            :placeholder="t('auth.confirmPasswordPlaceholder')" />
        </div>

        <div class="md:col-span-2">
          <p v-if="submitError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ submitError }}
          </p>
        </div>

        <div class="md:col-span-2">
          <button type="submit" :disabled="authStore.loading"
            class="w-full rounded-xl bg-[var(--mada-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mada-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70">
            {{ authStore.loading ? t('auth.creatingAccount') : t('auth.createAccount') }}
          </button>
        </div>

        <div class="md:col-span-2">
          <p class="text-center text-sm text-[var(--mada-muted)]">
            {{ t('auth.alreadyHaveAccount') }}
            <RouterLink :to="{ path: '/login', query: redirectQuery }"
              class="font-semibold text-[var(--mada-primary)] hover:underline">
              {{ t('auth.signIn') }}
            </RouterLink>
          </p>
        </div>
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
  name: "",
  phone: "",
  email: "",
  password: "",
  passwordConfirmation: "",
});
const submitError = ref("");

const redirectTo = computed(() => String(route.query.redirect || "/"));
const redirectQuery = computed(() =>
  route.query.redirect ? { redirect: route.query.redirect } : {},
);

async function handleSubmit() {
  submitError.value = "";

  if (form.password !== form.passwordConfirmation) {
    submitError.value = t('auth.passwordsNotMatch');
    return;
  }

  try {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      password_confirmation: form.passwordConfirmation,
    };

    await authStore.register(payload);

    if (authStore.isAuthenticated) {
      await router.push(redirectTo.value);
    } else {
      await authStore.login({
        email: form.email,
        password: form.password,
      });
      await router.push(redirectTo.value);
    }
  } catch (error) {
    submitError.value = error?.message || t('auth.unableCreate');
  }
}
</script>
