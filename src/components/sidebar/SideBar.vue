<template>
  <div class="sidebar shadow-[0 1px 3px rgba(0, 0, 0, 0.24)] relative flex flex-col">
    <RouterLink to="/">
      <div class="logo bg-brand-primary flex h-25 shrink-0 items-center justify-center">
        <img class="h-10" src="../../assets/sidebar-logo.svg" alt="LineageOS Logo" />
      </div>
    </RouterLink>
    <DeviceSelector :active-model="activeModel" />
  </div>
</template>

<script setup lang="ts">
import DeviceSelector from '../device-selector/DeviceSelector.vue'

defineProps<{ activeModel: string }>()
</script>
