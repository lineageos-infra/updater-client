<template>
  <div class="shadow-[0 1px 3px rgba(0, 0, 0, 0.24)] relative w-full shrink-0 text-lg">
    <div class="top flex justify-between leading-6">
      <div class="flex overflow-auto p-4 whitespace-nowrap">
        <slot name="left"></slot>
      </div>
      <div class="p-4">
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
          {{ tab.label }}
          <span v-if="tab?.icon" :class="tab?.icon"></span>
        </RouterLink>
        <a
          v-else
          class="px-4 pt-2 pb-3 text-sm font-medium uppercase no-underline"
          :class="tab?.class"
          :href="tab.href"
          target="_blank"
        >
          {{ tab.label }}
          <span v-if="tab?.icon" :class="tab?.icon"></span>
        </a>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: ({
    label: string
    target?: string
    class?: string
    icon?: string
  } & ({ to: string | object } | { href: string }))[]
}>()
</script>
