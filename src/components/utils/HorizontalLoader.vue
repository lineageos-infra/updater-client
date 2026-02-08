<template>
  <div v-if="showLoader" class="relative h-1 w-full overflow-hidden bg-[rgba(22,124,128,0.5)]">
    <div class="loader-first bg-brand-primary absolute top-0 left-0 h-full"></div>
    <div class="loader-second bg-brand-primary absolute top-0 left-0 h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUiStore } from '@/stores/ui'

const store = useUiStore()
const showLoader = ref(false)
const HIDE_DELAY_MS = 250
let hideTimeoutId: NodeJS.Timeout | undefined

watch(
  () => store.ongoingRequests,
  (count) => {
    if (count > 0) {
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId)
        hideTimeoutId = undefined
      }
      showLoader.value = true
      return
    }

    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId)
    }

    hideTimeoutId = setTimeout(() => {
      if (store.ongoingRequests === 0) {
        showLoader.value = false
      }
      hideTimeoutId = undefined
    }, HIDE_DELAY_MS)
  },
  { immediate: true }
)
</script>

<style scoped>
.loader-first {
  animation: horizontal-loader-animation-first 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}

.loader-second {
  animation: horizontal-loader-animation-second 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s
    infinite;
}

@keyframes horizontal-loader-animation-first {
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes horizontal-loader-animation-second {
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
}
</style>
