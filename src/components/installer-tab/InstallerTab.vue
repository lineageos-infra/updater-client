<template>
  <div class="flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <div class="mx-auto max-w-189 min-w-0 px-8">
        <div
          class="border-brand-primary my-4 inline-flex overflow-hidden rounded-full border border-solid"
        >
          <button
            class="relative flex items-center px-6 py-2 text-sm font-medium tracking-wide transition-colors duration-200"
            :class="
              activeTab === 'fastboot'
                ? 'bg-brand-primary/50 text-white'
                : 'text-brand-primary hover:bg-brand-primary/10 bg-transparent'
            "
            @click="activeTab = 'fastboot'"
          >
            <span v-if="activeTab === 'fastboot'" class="mdi mdi-check mr-1 text-lg"></span>
            <span class="flex items-center gap-2"> Fastboot Client </span>
          </button>
          <button
            class="border-brand-primary relative flex items-center border-l border-solid px-6 py-2 text-sm font-medium tracking-wide transition-colors duration-200"
            :class="
              activeTab === 'adb'
                ? 'bg-brand-primary/50 text-white'
                : 'text-brand-primary hover:bg-brand-primary/10 bg-transparent'
            "
            @click="activeTab = 'adb'"
          >
            <span v-if="activeTab === 'adb'" class="mdi mdi-check mr-1 text-lg"></span>
            <span class="flex items-center gap-2"> ADB Client </span>
          </button>
        </div>
        <FastbootClient v-if="activeTab === 'fastboot'" />
        <AdbClient v-if="activeTab === 'adb'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FastbootClient from '../fastboot-client/FastbootClient.vue'
import AdbClient from '../adb-client/AdbClient.vue'

const activeTab = ref<'fastboot' | 'adb'>('fastboot')
</script>
