<template>
  <div
    class="border-b border-solid border-black border-opacity-15 p-6 md:p-4 dark:border-white dark:border-opacity-15"
  >
    <div class="text-xs font-medium uppercase tracking-widest text-brand-primary" v-if="title">
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
