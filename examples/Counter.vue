<template>
  <!-- A small highlighting fixture, not a bundled application. -->
  <section class="counter" :aria-label="title">
    <h1>{{ title }}</h1>
    <input v-model.trim="title" placeholder="Counter title" />
    <button @click.prevent="count++">Count: {{ count }}</button>
    <p v-if="count > 0">{{ doubled }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.label }}</li>
    </ul>
    <slot name="footer" :count="count" />
    <template #default="slotProps">{{ slotProps }}</template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Item {
  id: number
  label: string
}

const title = ref<string>('Vue in Orca')
const count = ref(0)
const doubled = computed(() => count.value * 2)
const items: Item[] = [{ id: 1, label: 'Hello, Vue!' }]
// JavaScript and basic TypeScript tokens are included locally.
</script>

<style scoped>
/* Basic CSS, including units, custom properties and colors. */
.counter {
  --accent: #42b883;
  color: var(--accent);
  padding: 16px;
  display: grid;
  gap: 0.75rem;
}
.counter button:hover {
  opacity: 0.9;
}
</style>
