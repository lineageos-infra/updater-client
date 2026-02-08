<template>
  <div class="flex flex-col">
    <NavBar :tabs="tabs">
      <template v-slot:left>
        <span class="text"> All devices </span>
      </template>
    </NavBar>

    <div class="grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { watch } from 'vue'
import NavBar from '../components/navbar/NavBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMobile = useMediaQuery('(max-width: 1024px)')

watch(
  isMobile,
  async (val) => {
    if (val) {
      await router.push('/devices')
    } else {
      await router.push('/changes')
    }
  },
  { immediate: true }
)

const tabs = [
  {
    to: 'home_devices',
    label: 'Devices',
    class: 'lg:hidden'
  },
  {
    to: 'home_changes',
    label: 'Changes'
  },
  {
    to: 'home_verify',
    label: 'OTA Verifier'
  },
  {
    to: 'home_installer',
    label: 'Web Installer'
  }
]
</script>
