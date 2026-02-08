<template>
  <CollapsibleItem
    v-show="!hidden"
    class="border-b border-solid border-black/15 select-none dark:border-white/15"
    :forceExpanded="forceExpanded"
  >
    <template v-slot:title="{ isExpanded, toggleManualExpansion }">
      <div
        class="relative flex h-12 cursor-pointer items-center justify-between p-4 text-sm leading-4 font-medium transition-[height,padding,background] duration-250 ease-out"
        :class="{
          'h-16 bg-black/10 px-4 py-6 dark:bg-white/5': isExpanded
        }"
        @click="toggleManualExpansion"
      >
        <span>
          {{ name }}
        </span>
        <span
          v-if="!forceExpanded"
          class="mdi mdi-chevron-down text-2xl opacity-35 transition-transform duration-125 ease-out"
          :class="isExpanded && '-rotate-180'"
        >
        </span>
      </div>
    </template>
    <template v-slot:content>
      <div class="devices-container">
        <div class="devices">
          <template v-for="device in devices" :key="device.model">
            <DeviceItem v-bind="device"></DeviceItem>
          </template>
        </div>
      </div>
    </template>
  </CollapsibleItem>
</template>

<script setup lang="ts">
import type { Oem } from '@/stores/device'
import CollapsibleItem from '../utils/CollapsibleItem.vue'
import DeviceItem from './DeviceItem.vue'

defineProps<Oem>()
</script>
