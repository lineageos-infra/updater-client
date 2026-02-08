<template>
  <div class="border-b border-solid border-black/15 p-6 md:p-4 dark:border-white/15">
    <div v-if="title" class="text-brand-primary text-xs font-medium tracking-widest uppercase">
      {{ title }}
    </div>
    <DownloadableItem v-for="item in items" :key="item.sha1" v-bind="item" />
  </div>
</template>

<script setup lang="ts">
import type { BuildFile } from '@/stores/device'
import DownloadableItem from './DownloadableItem.vue'

defineProps<{
  title?: string
  items: BuildFile[]
}>()
</script>
