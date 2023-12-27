<template>
  <div class="group">
    <div
        class="group-header"
        v-if="title"
    >
      {{ title }}
    </div>
    <template v-for="item in items" :key="item.id">
      <downloadable-item v-bind="item"></downloadable-item>
    </template>
  </div>
</template>

<script>
import DownloadableItem from './DownloadableItem.vue';

export default {
  name: 'DownloadableGroup',
  components: {
    DownloadableItem,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    items: Array,
  },
}
</script>

<style scoped>
@import '../../css/group.css';
</style>