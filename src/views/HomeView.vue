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

<script setup>
import { useMediaQuery } from '@vueuse/core'
import { watch } from 'vue'
import NavBar from '../components/navbar/NavBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMobile = useMediaQuery('(max-width: 1024px)')

watch(
  isMobile,
  (val) => {
    if (val) {
      router.push('/devices')
    } else {
      router.push('/changes')
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
  }
]
</script>
