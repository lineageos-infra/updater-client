<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="emit('cancel')"
        @keydown.enter="emit('confirm')"
      >
        <div class="fixed inset-0 bg-black/40" @click="emit('cancel')" />
        <div
          ref="dialogEl"
          role="dialog"
          aria-modal="true"
          class="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-lg dark:bg-[#1e1e1e]"
          tabindex="-1"
        >
          <h2 class="mb-4 text-2xl font-medium">{{ title }}</h2>
          <div class="mb-6 wrap-break-word whitespace-pre-line text-black/75 dark:text-white/75">
            <slot />
          </div>
          <div class="flex justify-end gap-2">
            <button
              v-if="cancelLabel !== undefined"
              class="btn btn-ghost h-10 px-6"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </button>
            <button class="btn h-10 px-6" @click="emit('confirm')">
              {{ confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTemplateRef, watch, nextTick } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  confirmLabel?: string
  cancelLabel?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const dialogEl = useTemplateRef('dialogEl')

watch(
  () => props.open,
  async (val) => {
    if (val) {
      await nextTick()
      dialogEl.value?.focus()
    }
  }
)
</script>

<style scoped>
.dialog-enter-active {
  transition:
    opacity 150ms cubic-bezier(0.2, 0, 0, 1),
    transform 150ms cubic-bezier(0.2, 0, 0, 1);
}
.dialog-leave-active {
  transition:
    opacity 75ms cubic-bezier(0.2, 0, 0, 1),
    transform 75ms cubic-bezier(0.2, 0, 0, 1);
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
