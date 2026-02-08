<template>
  <RouterLink
    :to="{
      name: 'device_index',
      params: {
        model: model
      }
    }"
  >
    <div
      v-show="!hidden"
      class="flex items-center justify-between gap-4 border-t border-black/12 p-4 pl-8 text-sm leading-4 font-medium"
      :class="selected ? 'bg-brand-primary' : ''"
    >
      <span :class="selected ? 'text-white/87' : ''">
        {{ name }}
      </span>
      <span :class="selected ? 'text-white/50' : ''">
        {{ model }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import type { OemDevice } from '@/stores/device'

defineProps<OemDevice>()
</script>
