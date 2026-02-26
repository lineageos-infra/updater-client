<template>
  <div class="shadow-[0 1px 3px rgba(0, 0, 0, 0.24)] relative w-full shrink-0 text-lg">
    <div class="top flex justify-between leading-6">
      <div class="flex items-center overflow-auto p-4 whitespace-nowrap">
        <slot name="left"></slot>
      </div>
      <div class="flex shrink-0 items-center gap-2 p-2 lg:gap-4">
        <button class="btn cursor-pointer rounded-lg p-2" @click="toggleDark()">
          <MdiIcon :path="isDark ? mdiWeatherNight : mdiWeatherSunny" />
        </button>
        <img class="h-6 lg:hidden" src="../../assets/navbar-logo.svg" alt="LineageOS Logo" />
      </div>
    </div>
    <div class="flex overflow-auto leading-4 whitespace-nowrap">
      <template v-for="tab in tabs" :key="tab.label">
        <RouterLink
          v-if="'to' in tab"
          class="px-4 pt-2 pb-3 text-sm font-medium uppercase no-underline"
          :class="tab?.class"
          active-class="border-b-4 border-b-brand-primary"
          :to="typeof tab.to === 'string' ? { name: tab.to } : tab.to"
        >
          <span class="inline-flex items-center gap-1">
            {{ tab.label }}
            <MdiIcon v-if="tab?.icon" :path="tab?.icon" :size="14" />
          </span>
        </RouterLink>
        <a
          v-else
          class="px-4 pt-2 pb-3 text-sm font-medium uppercase no-underline"
          :class="tab?.class"
          :href="tab.href"
          target="_blank"
        >
          <span class="inline-flex items-center gap-1">
            {{ tab.label }}
            <MdiIcon v-if="tab?.icon" :path="tab?.icon" :size="14" />
          </span>
        </a>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiIcon from '@/components/mdi-icon/MdiIcon.vue'
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js'
import { useDark, useToggle } from '@vueuse/core'

defineProps<{
  tabs: ({
    label: string
    target?: string
    class?: string
    icon?: string
  } & ({ to: string | object } | { href: string }))[]
}>()

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>
