<template>
  <div
    class="relative hidden h-full w-75 max-w-[30%] min-w-32 flex-col shadow-[0_1px_3px_rgba(0,0,0,0.24)] lg:flex"
  >
    <RouterLink to="/">
      <div class="logo bg-brand-primary flex h-25 shrink-0 items-center justify-center">
        <Logo class="h-10 fill-white" />
      </div>
    </RouterLink>
    <DeviceSelector :active-model="activeModel" />
  </div>
</template>

<script setup lang="ts">
import DeviceSelector from '../device-selector/DeviceSelector.vue'
import { Logo } from '@/services/branding'

defineProps<{ activeModel?: string }>()
</script>
