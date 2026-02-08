<template>
  <div class="flex items-center justify-center text-center text-2xl">
    <span>{{ store.error || message }}</span>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { onMounted } from 'vue'
const store = useUiStore()
defineProps({
  message: {
    type: String,
    default: 'An unknown error occurred'
  }
})

onMounted(() => {
  history.pushState({}, '', '/')
})
</script>
