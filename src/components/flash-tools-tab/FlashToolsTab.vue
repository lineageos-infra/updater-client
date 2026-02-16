<template>
  <div class="flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <div class="mx-auto max-w-189 min-w-0 px-8">
        <div class="flex flex-col items-start gap-4 px-6 py-10 sm:px-4">
          <h1 class="m-0 flex-none self-stretch text-3xl font-medium">Flash Tools</h1>
          <div class="order-1 flex-none grow-0 self-stretch">
            <p>
              You can use your browser to flash with the Fastboot tab and sideload OTA packages
              (lineage-*.zip) with the ADB tab. Switch tabs below to continue.
            </p>
            <p>
              As installation steps vary by device, please refer to the
              <a
                href="https://wiki.lineageos.org"
                target="_blank"
                class="text-brand-primary font-medium no-underline"
              >
                wiki
              </a>
              for device-specific instructions.
            </p>
          </div>
        </div>
        <template v-if="webUsbSupported">
          <div
            class="mb-4 overflow-hidden rounded-2xl border border-solid border-black/15 bg-gray-200 shadow-sm dark:border-white/10 dark:bg-black"
          >
            <div
              class="dark:bg-brand-dark flex items-center gap-2 border-b border-black/10 bg-white px-2 pt-2 dark:border-white/10"
            >
              <button
                class="cursor-pointer rounded-t-lg px-4 py-1 text-xs font-semibold tracking-wider uppercase transition-colors duration-200"
                :class="
                  activeTab === 'fastboot'
                    ? 'bg-brand-primary text-white'
                    : 'text-black/60 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'
                "
                @click="activeTab = 'fastboot'"
              >
                1: Fastboot
              </button>
              <button
                class="cursor-pointer rounded-t-lg px-4 py-1 text-xs font-semibold tracking-wider uppercase transition-colors duration-200"
                :class="
                  activeTab === 'adb'
                    ? 'bg-brand-primary text-white'
                    : 'text-black/60 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'
                "
                @click="activeTab = 'adb'"
              >
                2: ADB
              </button>
            </div>
            <div class="relative">
              <textarea
                ref="log"
                class="w-full resize-none bg-gray-200 p-6 font-mono focus:outline-none md:p-4 dark:bg-black dark:text-white"
                rows="14"
                readonly
                :value="activeLog"
              ></textarea>
              <div
                v-if="activeLog.trim().length === 0"
                class="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div class="flex items-center gap-3 text-black/60 dark:text-white/70">
                  <div class="relative inline-flex items-start gap-8">
                    <MdiIcon :path="mdiUsb" class="relative z-10 text-2xl opacity-80" />
                    <MdiIcon :path="mdiUsbPort" class="relative z-10 text-2xl opacity-80" />
                    <svg
                      class="absolute top-1/2 right-4.5 left-4.5 z-0 h-5 w-[calc(100%-36px)] -translate-y-1/2 text-black/25 dark:text-white/50"
                      viewBox="0 0 84 20"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M6,10 C18,2 30,2 42,10 S66,18 78,10"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-dasharray="140"
                        stroke-dashoffset="140"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="140;0;140"
                          keyTimes="0;0.5;1"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.25;0.8;0.25"
                          keyTimes="0;0.5;1"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </div>
                  <span class="text-xs tracking-wide uppercase">Waiting for USB</span>
                </div>
              </div>
            </div>
          </div>
          <FastbootClient
            v-show="activeTab === 'fastboot'"
            :append-log="(message) => appendLog('fastboot', message)"
            :clear-log="() => clearLog('fastboot')"
          />
          <AdbClient
            v-show="activeTab === 'adb'"
            :append-log="(message) => appendLog('adb', message)"
            :update-last-log="(message) => updateLastLog('adb', message)"
          />
        </template>
        <div v-else class="flex flex-col items-start gap-4 px-6 sm:px-4">
          <p class="bg-[#f8d7da] text-lg font-medium dark:bg-[#522b2a] dark:text-[#f8d7da]">
            Your browser does not support WebUSB! Please use a Chromium based browser.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import FastbootClient from '../fastboot-client/FastbootClient.vue'
import AdbClient from '../adb-client/AdbClient.vue'
import MdiIcon from '@/components/mdi-icon/MdiIcon.vue'
import { mdiUsb, mdiUsbPort } from '@mdi/js'

// @ts-expect-error: Some browsers have WebUSB, do not enforce strict type check here
const webUsbSupported = typeof navigator !== 'undefined' && navigator.usb !== undefined

const activeTab = ref<'fastboot' | 'adb'>('fastboot')
const logs = reactive({ fastboot: '', adb: '' })
const log = useTemplateRef('log')

const activeLog = computed(() => logs[activeTab.value])

async function scrollLogToBottom() {
  await nextTick()
  if (!log.value) return
  log.value.scrollTop = log.value.scrollHeight
}

function appendLog(tab: 'fastboot' | 'adb', message: string) {
  logs[tab] = logs[tab].length ? `${logs[tab]}\n${message}` : message
  if (tab === activeTab.value) {
    void scrollLogToBottom()
  }
}

function updateLastLog(tab: 'fastboot' | 'adb', message: string) {
  const lines = logs[tab].split('\n')
  if (lines.length === 0) {
    logs[tab] = message
  } else {
    lines[lines.length - 1] = message
    logs[tab] = lines.join('\n')
  }
  if (tab === activeTab.value) {
    void scrollLogToBottom()
  }
}

function clearLog(tab: 'fastboot' | 'adb') {
  logs[tab] = ''
}

watch(activeTab, () => {
  void scrollLogToBottom()
})
</script>
