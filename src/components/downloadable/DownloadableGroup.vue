<template>
  <div
    class="p-6 md:p-4 border-b border-solid border-black dark:border-white border-opacity-15 dark:border-opacity-15"
  >
    <div class="text-xs font-medium uppercase text-brand-primary tracking-widest" v-if="title">
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
