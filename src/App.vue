<template>
  <RouterView name="sidebar"></RouterView>
  <RouterView id="main" class="h-full w-full grow" name="main"></RouterView>
  <HorizontalLoader class="absolute bottom-0 left-0" />
</template>

<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue'
import HorizontalLoader from './components/utils/HorizontalLoader.vue'

useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | LineageOS Downloads` : 'LineageOS Downloads'),
  ogTitle: 'LineageOS Downloads'
})
</script>
