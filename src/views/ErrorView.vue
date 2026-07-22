<template>
  <div class="flex items-center justify-center text-center text-2xl">
    <span>{{ store.error || message }}</span>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const store = useUiStore()
defineProps({
  message: {
    type: String,
    default: 'An unknown error occurred'
  }
})

onMounted(async () => {
  await router.push('/')
})
</script>
