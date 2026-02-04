<template>
  <div class="border-b border-solid border-black/15 p-6 md:p-4 dark:border-white/15">
    <div v-if="title" class="text-brand-primary text-xs font-medium tracking-widest uppercase">
      {{ title }}
    </div>
    <template v-for="item in items" :key="item.id">
      <DownloadableItem v-bind="item"></DownloadableItem>
    </template>
  </div>
</template>

<script setup>
import DownloadableItem from './DownloadableItem.vue'

defineProps({
  title: {
    type: String,
    default: ''
  },
  items: Array
})
</script>
