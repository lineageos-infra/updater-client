<template>
  <RouterView name="sidebar"></RouterView>
  <RouterView id="main" class="h-full w-full grow" name="main"></RouterView>
  <HorizontalLoader class="absolute bottom-0 left-0" />
  <AgeVerification v-if="showAgeVerification" @close="showAgeVerification = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AgeVerification from './components/age-verification/AgeVerification.vue'
import HorizontalLoader from './components/utils/HorizontalLoader.vue'

const showAgeVerification = ref(true)
</script>
