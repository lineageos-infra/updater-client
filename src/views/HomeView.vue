<template>
  <div class="flex flex-col">
    <NavBar class="shrink-0">
      <template v-slot:left>
        <span class="text"> All devices </span>
      </template>
      <template v-slot:tabs>
        <RouterLink class="tab block lg:hidden" :to="{ name: 'home_devices' }">
          Devices
        </RouterLink>
        <RouterLink class="tab" :to="{ name: 'home_changes' }"> Changes </RouterLink>
        <RouterLink class="tab" :to="{ name: 'home_verify' }"> OTA Verifier </RouterLink>
      </template>
    </NavBar>

    <div class="grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import NavBar from '../components/navbar/NavBar.vue'
</script>
