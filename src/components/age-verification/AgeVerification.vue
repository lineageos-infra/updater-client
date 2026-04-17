<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="Age verification popup"
    @click.self="closePopup"
  >
    <div class="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1c2024]">
      <div class="bg-brand-primary relative p-5 text-white">
        <button
          type="button"
          class="absolute top-4 right-3 inline-flex size-8 items-center justify-center rounded-md text-white/90 transition hover:bg-white/20 hover:text-white"
          aria-label="Close age verification dialog"
          @click="closePopup"
        >
          <MdiIcon :path="mdiClose" :size="18" />
        </button>
        <h6 class="flex items-center gap-2 uppercase">
          <svg
            class="size-8 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M5,3L19,3C20.105,3 21,3.895 21,5L21,12C21,16.971 16.971,21 12,21C7.029,21 3,16.971 3,12L3,5C3,3.895 3.895,3 5,3ZM18.902,13.168C18.994,12.624 18.627,12.108 18.082,12.016C17.538,11.925 17.022,12.292 16.93,12.837C16.528,15.225 14.45,17 12,17C9.55,17 7.472,15.226 7.069,12.838C6.978,12.294 6.462,11.927 5.917,12.018C5.373,12.11 5.005,12.626 5.097,13.171C5.661,16.517 8.57,19 12,19C15.43,19 18.339,16.516 18.902,13.168ZM11.046,5.698L9.127,11.297C9.045,11.516 9,11.753 9,12C9,13.104 9.895,14 11,14C11.01,14 11.019,14 11.029,14L13,14C13.55,14 14.05,13.78 14.41,13.41C14.78,13.05 15,12.55 15,12L12.6,12L11,11.999L11.438,10.724L11.646,10.116L12.938,6.346C12.978,6.238 13,6.121 13,6C13,5.448 12.552,5 12,5C11.553,5 11.174,5.293 11.046,5.698Z"
            />
          </svg>
          <span>Age Verification Portal</span>
        </h6>
      </div>

      <div class="space-y-5 p-6">
        <section v-if="phase === 'scanning'" class="space-y-4">
          <div class="rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <p class="text-sm opacity-80">Scanning your face for age confidence score...</p>
            <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                class="bg-brand-primary h-full rounded-full transition-all duration-300 ease-out"
                :style="{ width: `${scanProgress}%` }"
              ></div>
            </div>
            <p class="mt-2 text-xs opacity-70">{{ scanProgress }}% complete</p>
          </div>
        </section>

        <section v-if="phase === 'passed'" class="space-y-4">
          <div
            class="rounded-xl border border-[#bde0c8] bg-[#e7f6ec] p-4 dark:border-[#2d6b46] dark:bg-[#1c3f2a]"
          >
            <p class="text-sm font-medium text-[#1f6b3a] dark:text-[#d7f6e3]">
              Age Verification Passed. Estimated age: {{ age }}, definitely human, definitely not a
              cat.
            </p>
            <p class="mt-2 text-xs opacity-80">
              Your biometric data will now be sent to private corporations for AI training and
              optimization purposes.
            </p>
          </div>
        </section>

        <section>
          <p class="text-sm font-medium">Preview</p>
          <div
            class="scan-frame mt-3 flex min-h-40 items-center justify-center overflow-hidden rounded-xl bg-black/5 dark:bg-white/5"
          >
            <img :src="previewImageUrl" alt="Cat Preview" class="h-64 w-full object-cover" />
            <div
              v-if="phase === 'scanning'"
              class="scan-tint pointer-events-none absolute inset-0"
            ></div>
            <div
              v-if="phase === 'scanning'"
              class="scan-line pointer-events-none absolute inset-x-0 h-10"
            ></div>
          </div>
        </section>

        <div class="flex items-center justify-end gap-2">
          <button v-if="phase === 'passed'" type="button" class="btn px-5 py-2" @click="closePopup">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiIcon from '@/components/mdi-icon/MdiIcon.vue'
import { mdiClose } from '@mdi/js'
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Phase = 'scanning' | 'passed'

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)
const phase = ref<Phase>('scanning')
const scanProgress = ref(0)
const previewImageUrl = 'https://cataas.com/cat'
const age = ref(18)

let scanInterval: ReturnType<typeof setInterval> | undefined

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePopup()
  }
}

const clearTimers = () => {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = undefined
  }
}

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

const startFakeScan = () => {
  phase.value = 'scanning'
  scanProgress.value = 0
  age.value = getRandomInt(18, 60)

  scanInterval = setInterval(() => {
    const jump = Math.floor(Math.random() * 12) + 6
    scanProgress.value = Math.min(100, scanProgress.value + jump)

    if (scanProgress.value >= 100) {
      clearTimers()
      phase.value = 'passed'
    }
  }, 400)
}

const closePopup = () => {
  clearTimers()
  isVisible.value = false
  emit('close')
}

onMounted(() => {
  startFakeScan()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.scan-frame {
  position: relative;
  isolation: isolate;
}

.scan-tint {
  background: linear-gradient(to bottom, rgba(90, 200, 255, 0.08), rgba(0, 0, 0, 0.06));
  animation: scan-flicker 1.8s steps(2, end) infinite;
}

.scan-line {
  top: -12%;
  background: linear-gradient(
    to bottom,
    rgba(80, 220, 255, 0),
    rgba(80, 220, 255, 0.5),
    rgba(80, 220, 255, 0)
  );
  box-shadow: 0 0 18px rgba(80, 220, 255, 0.45);
  animation: scan-sweep 2s linear infinite;
}

@keyframes scan-sweep {
  0% {
    top: -12%;
  }

  100% {
    top: 100%;
  }
}

@keyframes scan-flicker {
  0%,
  100% {
    opacity: 0.9;
  }

  50% {
    opacity: 0.75;
  }
}
</style>
