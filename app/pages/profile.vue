<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-8">
    <header class="mb-12 text-center">
      <h1 class="mb-2 text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">My Profile</h1>
      <p class="text-base text-[var(--mada-muted)] md:text-lg">
        Manage your account information
      </p>
    </header>

    <div v-if="!auth.isAuthenticated" class="rounded-lg bg-white p-8 shadow-sm text-center">
      <p class="mb-4 text-lg text-[var(--mada-muted)]">You need to be logged in to view your profile</p>
      <NuxtLink
        to="/login"
        class="inline-block rounded-md bg-[var(--mada-primary)] px-6 py-3 font-medium text-white transition hover:opacity-90"
      >
        Go to Login
      </NuxtLink>
    </div>

    <div v-else class="rounded-lg bg-white p-8 shadow-sm">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <!-- Name Field -->
        <div class="flex flex-col gap-3">
          <label for="name" class="font-medium text-[var(--mada-dark)]">
            Full Name *
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Enter your full name"
            class="rounded-md border border-[var(--mada-border)] px-4 py-3 text-base focus:border-[var(--mada-primary)] focus:outline-none"
          />
          <p v-if="fieldErrors.name" class="text-sm text-red-500">{{ fieldErrors.name }}</p>
        </div>

        <!-- Email Field -->
        <div class="flex flex-col gap-3">
          <label for="email" class="font-medium text-[var(--mada-dark)]">
            Email Address *
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="your.email@example.com"
            class="rounded-md border border-[var(--mada-border)] px-4 py-3 text-base focus:border-[var(--mada-primary)] focus:outline-none"
          />
          <p v-if="fieldErrors.email" class="text-sm text-red-500">{{ fieldErrors.email }}</p>
        </div>

        <!-- Phone Field -->
        <div class="flex flex-col gap-3">
          <label for="phone" class="font-medium text-[var(--mada-dark)]">
            Phone Number
          </label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            class="rounded-md border border-[var(--mada-border)] px-4 py-3 text-base focus:border-[var(--mada-primary)] focus:outline-none"
          />
          <p v-if="fieldErrors.phone" class="text-sm text-red-500">{{ fieldErrors.phone }}</p>
        </div>

        <!-- Company Field -->
        <div class="flex flex-col gap-3">
          <label for="company" class="font-medium text-[var(--mada-dark)]">
            Company Name
          </label>
          <input
            id="company"
            v-model="formData.company"
            type="text"
            placeholder="Your company name"
            class="rounded-md border border-[var(--mada-border)] px-4 py-3 text-base focus:border-[var(--mada-primary)] focus:outline-none"
          />
          <p v-if="fieldErrors.company" class="text-sm text-red-500">{{ fieldErrors.company }}</p>
        </div>

        <!-- Address Field -->
        <div class="flex flex-col gap-3">
          <label for="address" class="font-medium text-[var(--mada-dark)]">
            Address
          </label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            placeholder="Your address"
            class="rounded-md border border-[var(--mada-border)] px-4 py-3 text-base focus:border-[var(--mada-primary)] focus:outline-none"
          />
          <p v-if="fieldErrors.address" class="text-sm text-red-500">{{ fieldErrors.address }}</p>
        </div>

        <!-- City Field -->
        <div class="flex flex-col gap-3">
          <label for="city" class="font-medium text-[var(--mada-dark)]">
            City
          </label>
          <input
            id="city"
            v-model="formData.city"
            type="text"
            placeholder="Your city"
            class="rounded-md border border-[var(--mada-border)] px-4 py-3 text-base focus:border-[var(--mada-primary)] focus:outline-none"
          />
          <p v-if="fieldErrors.city" class="text-sm text-red-500">{{ fieldErrors.city }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4 text-sm text-green-700">
          {{ successMessage }}
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            @click="handleCancel"
            :disabled="auth.loading"
            class="rounded-md bg-[var(--mada-soft)] px-8 py-3 font-medium text-[var(--mada-dark)] transition hover:bg-[var(--mada-border)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="auth.loading"
            class="rounded-md bg-[var(--mada-primary)] px-8 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="!auth.loading">Save Changes</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/stores/locale";

definePageMeta({
  requiresAuth: true,
});

const auth = useAuthStore();
const localeStore = useLocaleStore();
const t = localeStore.t;
const router = useRouter();

useHead(() => ({
  title: `${t('nav.profile')} — ${t('app.siteName')}`,
  meta: [
    { name: 'description', content: t('app.profileMetaDescription') },
  ],
}))

const formData = reactive({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
});

const fieldErrors = reactive({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
});

const errorMessage = ref("");
const successMessage = ref("");
const initialData = ref({});

// Load user data on mount
onMounted(() => {
  if (auth.user) {
    loadUserData();
  }
});

function loadUserData() {
  if (!auth.user) return;

  // Map user data to form fields
  formData.name = auth.user.name || "";
  formData.email = auth.user.email || "";
  formData.phone = auth.user.phone || "";
  formData.company = auth.user.company || "";
  formData.address = auth.user.address || "";
  formData.city = auth.user.city || "";

  // Keep track of initial data for comparison
  initialData.value = { ...formData };
}

function clearErrors() {
  errorMessage.value = "";
  successMessage.value = "";
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = "";
  });
}

async function handleSubmit() {
  clearErrors();

  try {
    // Basic validation
    if (!formData.name || !formData.name.trim()) {
      fieldErrors.name = "Name is required";
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      fieldErrors.email = "Email is required";
      return;
    }

    // Prepare payload with only the fields
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
    };

    // Remove undefined values
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    await auth.updateProfile(payload);

    successMessage.value = "Profile updated successfully!";

    // Reset initial data
    initialData.value = { ...formData };

    // Reload user data
    await auth.fetchProfile();

    // Clear success message after 3 seconds
    setTimeout(() => {
      clearErrors();
    }, 3000);
  } catch (err) {
    errorMessage.value = err?.message || "Failed to update profile. Please try again.";
  }
}

function handleCancel() {
  // Reset form to initial data
  Object.keys(formData).forEach((key) => {
    formData[key] = initialData.value[key] || "";
  });
  clearErrors();
}
</script>
