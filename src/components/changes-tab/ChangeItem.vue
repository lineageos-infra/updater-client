<template>
  <div class="change py-2">
    <a class="block leading-7 break-all text-inherit no-underline" target="_blank" :href="url">
      {{ subject }}
    </a>
    <div class="flex items-center text-xs leading-6">
      <span class="bg-dark/15 mr-2 rounded-xl px-2 dark:bg-white/15">
        {{ type }}
      </span>

      <span v-if="!build?.version" class="bg-dark/15 mr-2 rounded-xl px-2 dark:bg-white/15">
        {{ branch }}
      </span>

      <a
        class="block break-all text-inherit no-underline"
        target="_blank"
        :href="`https://github.com/${project}`"
      >
        {{ repository }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChangeGroupBuild } from '@/services/ApiService'
import type { Change } from '@/stores/change'

defineProps<Change & { build?: ChangeGroupBuild }>()
</script>
