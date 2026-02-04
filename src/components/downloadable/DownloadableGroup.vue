<template>
  <div class="border-b border-solid border-black/15 p-6 md:p-4 dark:border-white/15">
    <div v-if="title" class="text-brand-primary text-xs font-medium tracking-widest uppercase">
      {{ title }}
    </div>
    <template v-for="item in items" :key="item.id">
      <downloadable-item v-bind="item"></downloadable-item>
    </template>
  </div>
</template>

<script>
import DownloadableItem from './DownloadableItem.vue'

export default {
  name: 'DownloadableGroup',
  components: {
    DownloadableItem
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    items: Array
  }
}
</script>
