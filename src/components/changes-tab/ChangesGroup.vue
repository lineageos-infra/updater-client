<template>
  <div
    class="p-4 border-b border-solid border-black dark:border-white border-opacity-15 dark:border-opacity-15"
    v-if="items.length"
  >
    <div class="text-xs font-medium uppercase text-brand-primary tracking-widest" v-if="build">
      <template v-if="build.filename === 'next'">
        To be included in the next {{ build.version }} build
      </template>
      <template v-else> Included in {{ build.filename }} </template>
    </div>
    <template v-for="change in items" :key="change.id">
      <change-tab v-bind:="change" :build="build"></change-tab>
    </template>
  </div>
</template>

<script>
import ChangeTab from './ChangeTab.vue'

export default {
  name: 'ChangesGroup',
  components: {
    ChangeTab
  },
  props: {
    build: Object,
    items: Array
  }
}
</script>
