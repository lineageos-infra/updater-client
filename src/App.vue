<template>
  <RouterView name="sidebar" />
  <RouterView id="main" class="h-full w-full" name="main" />
  <HorizontalLoader class="absolute bottom-0 left-0" />
</template>

<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue'
import HorizontalLoader from './components/utils/HorizontalLoader.vue'
import { BRAND_NAME } from './services/config'

const siteTitle = `${BRAND_NAME} Downloads`

useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | ${siteTitle}` : siteTitle),
  ogTitle: siteTitle
})
</script>
