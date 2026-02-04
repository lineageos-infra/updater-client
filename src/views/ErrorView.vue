<template>
  <div class="flex items-center justify-center text-center text-2xl">
    <span>{{ store.getters.error || message }}</span>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { onMounted } from 'vue'
const store = useStore()
defineProps({
  message: {
    type: String,
    default: 'An unknown error occurred'
  }
})

onMounted(() => {
  history.pushState({}, null, '/')
})
</script>
