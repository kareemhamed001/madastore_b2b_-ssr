<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <h1 class="relative -top-2.5 text-center text-4xl font-medium text-[var(--mada-primary)] lg:text-left">{{ msg }}</h1>
    <h3 class="text-center text-xl lg:text-left">
      You’ve successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener" class="text-[var(--mada-primary)] hover:underline">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener" class="text-[var(--mada-primary)] hover:underline">Vue 3</a>.
    </h3>
  </div>
</template>
