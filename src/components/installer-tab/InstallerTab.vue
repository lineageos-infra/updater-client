<template>
  <div class="flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <div class="mx-auto max-w-189 min-w-0 px-8">
        <div class="flex flex-col items-start gap-4 px-6 py-10 sm:px-4">
          <h1 class="m-0 flex-none self-stretch text-3xl font-medium">Web Installer</h1>
          <div class="order-1 flex-none grow-0 self-stretch">
            <p>
              You can use your browser to flash and reboot to recovery with the Fastboot tab and
              sideload OTA packages (lineage-*.zip) with the ADB tab. Switch tabs below to continue.
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
        <div class="mb-4 overflow-hidden rounded-2xl border border-solid border-black/25 bg-black">
          <div class="flex items-center gap-2 border-b border-white/10 px-3 pt-2">
            <button
              class="rounded-t-lg px-4 py-1 text-xs font-semibold tracking-wider uppercase transition-colors duration-200"
              :class="
                activeTab === 'fastboot'
                  ? 'bg-brand-primary/70 text-white'
                  : 'text-white/70 hover:bg-white/10'
              "
              @click="activeTab = 'fastboot'"
            >
              1: Fastboot
            </button>
            <button
              class="rounded-t-lg px-4 py-1 text-xs font-semibold tracking-wider uppercase transition-colors duration-200"
              :class="
                activeTab === 'adb'
                  ? 'bg-brand-primary/70 text-white'
                  : 'text-white/70 hover:bg-white/10'
              "
              @click="activeTab = 'adb'"
            >
              2: ADB
            </button>
          </div>
          <textarea
            ref="log"
            class="w-full resize-none bg-black p-6 font-mono text-white focus:outline-none md:p-4"
            rows="14"
            readonly
            :value="activeLog"
          ></textarea>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import FastbootClient from '../fastboot-client/FastbootClient.vue'
import AdbClient from '../adb-client/AdbClient.vue'

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
