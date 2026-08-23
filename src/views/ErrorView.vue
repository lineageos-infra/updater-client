<template>
  <main class="flex flex-col items-center justify-center text-center">
    <span class="text-2xl">{{ message }}</span>
    <button class="btn mt-2 px-4 py-1" @click="router.push('/')">Go back home</button>
  </main>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const store = useUiStore()

const props = defineProps({
  message: {
    type: String,
    default: 'An unknown error occurred'
  }
})

const message = store.error || props.message

onMounted(() => {
  if (store.errorPath !== undefined) {
    // Use window instead of router here to avoid infinite loop
    window.history.pushState({}, '', store.errorPath)
  }
})
</script>
