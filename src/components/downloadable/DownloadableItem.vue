<template>
  <CollapsibleItem class="align-middle leading-6">
    <template v-slot:title="{ isExpanded, toggleManualExpansion }">
      <div
        class="mx-0 my-1 flex items-center justify-between gap-2"
        :class="{
          expanded: isExpanded
        }"
      >
        <div>
          {{ filename }}
        </div>
        <div class="flex items-center gap-2">
          <a :href="url" class="btn px-5 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-brand-dark dark:text-brand-light hover:text-white hover:transition hover:duration-150 hover:ease-out"
            >
              <path
                d="M2 16C1.45 16 0.979333 15.8043 0.588 15.413C0.196 15.021 0 14.55 0 14V11H2V14H14V11H16V14C16
              14.55 15.8043 15.021 15.413 15.413C15.021 15.8043 14.55 16 14 16H2ZM8 12L3 7L4.4 5.55L7 8.15V0H9V8.15L11.6 5.55L13 7L8 12Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <span
            class="mdi transition-[background 0.125s ease-out] hover:bg-dark/15 block size-9 shrink-0 cursor-pointer rounded-[50%] text-center text-2xl leading-9 opacity-55 select-none dark:opacity-55 dark:hover:bg-white/15"
            :class="{ 'mdi-information': isExpanded, 'mdi-information-outline': !isExpanded }"
            @click="toggleManualExpansion"
          ></span>
        </div>
      </div>
    </template>
    <template v-slot:content>
      <div class="rounded-md dark:bg-white/5">
        <div class="flex flex-col gap-2 rounded-sm bg-black/5 p-4 text-sm leading-6">
          <span class="flex leading-[150%]">Details</span>
          <DownloadableDetail v-if="date" title="Date" :value="date" />
          <DownloadableDetail
            v-if="osPatchLevelHuman"
            title="OS patch level"
            :value="osPatchLevelHuman"
          />
          <DownloadableDetail v-if="type" title="Type" :value="type" />
          <DownloadableDetail v-if="sizeHuman" title="Size" :value="sizeHuman" />
          <DownloadableDetail v-if="sha256" title="SHA256" :value="sha256" />
        </div>
      </div>
    </template>
  </CollapsibleItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CollapsibleItem from '../utils/CollapsibleItem.vue'
import DownloadableDetail from './DownloadableDetail.vue'
import type { BuildFile } from '@/stores/device'

const props = defineProps<BuildFile>()

const osPatchLevelHuman = computed(() => {
  if (typeof props.os_patch_level === 'string') {
    return new Date(props.os_patch_level).toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }
  return ''
})

const sizeHuman = computed(() => {
  if (props.size !== undefined) {
    const units = {
      GiB: 3,
      MiB: 2,
      KiB: 1
    }

    for (const [unit, exponent] of Object.entries(units)) {
      if (props.size >= Math.pow(1024, exponent)) {
        return `${(props.size / Math.pow(1024, exponent)).toFixed(2)} ${unit}`
      }
    }

    return `${props.size} B`
  }
  return ''
})
</script>
