<template>
  <div
    class="shadow-[0 1px 3px rgba(0, 0, 0, 0.24)] relative hidden h-full w-75 max-w-[30%] min-w-32 flex-col lg:flex"
  >
    <RouterLink to="/">
      <div class="logo bg-brand-primary flex h-25 shrink-0 items-center justify-center">
        <div class="h-10 [&_path]:fill-white" v-html="logo"></div>
      </div>
    </RouterLink>
    <DeviceSelector :active-model="activeModel" />
  </div>
</template>

<script setup lang="ts">
import DeviceSelector from '../device-selector/DeviceSelector.vue'
import logo from '../../assets/logo.svg?raw'

defineProps<{ activeModel?: string }>()
</script>
