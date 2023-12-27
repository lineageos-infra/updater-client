<template>
  <div class="group" v-if="items.length">
    <div
        class="group-header"
        v-if="build"
    >
      <template v-if="build.filename === 'next'">
        To be included in the next {{ build.version }} build
      </template>
      <template v-else>
        Included in {{ build.filename }}
      </template>
    </div>
    <template v-for="change in items" :key="change.id">
      <change-tab v-bind:="change" :build="build"></change-tab>
    </template>
  </div>
</template>

<script>
import ChangeTab from './ChangeTab.vue';

export default {
  name: 'ChangesGroup',
  components: {
    ChangeTab,
  },
  props: {
    build: Object,
    items: Array,
  },
}
</script>

<style scoped>
@import '../../css/group.css';
</style>