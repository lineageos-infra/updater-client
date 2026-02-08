<template>
  <div v-if="items.length" class="border-b border-solid border-black/15 p-4 dark:border-white/15">
    <div v-if="build" class="text-brand-primary text-xs font-medium tracking-widest uppercase">
      <template v-if="build.filename === 'next'">
        To be included in the next {{ build.version }} build
      </template>
      <template v-else> Included in {{ build.filename }} </template>
    </div>
    <ChangeItem v-for="change in items" :key="change.url" v-bind:="change" :build="build" />
  </div>
</template>

<script setup lang="ts">
import type { ChangeGroupBuild } from '@/services/ApiService'
import ChangeItem from './ChangeItem.vue'
import type { Change } from '@/stores/change'

defineProps<{
  build?: ChangeGroupBuild
  items: Change[]
}>()
</script>
