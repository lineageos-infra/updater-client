<template>
  <div v-if="items.length" class="border-b border-solid border-black/15 p-4 dark:border-white/15">
    <div v-if="build" class="text-brand-primary text-xs font-medium tracking-widest uppercase">
      <template v-if="build.filename === 'next'">
        To be included in the next {{ build.version }} build
      </template>
      <template v-else> Included in {{ build.filename }} </template>
    </div>
    <template v-for="change in items" :key="change.id">
      <ChangeTab v-bind:="change" :build="build"></ChangeTab>
    </template>
  </div>
</template>

<script setup>
import ChangeTab from './ChangeTab.vue'

defineProps({
  build: Object,
  items: Array
})
</script>
