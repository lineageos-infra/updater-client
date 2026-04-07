<template>
  <div class="order-1 flex-none grow-0 self-stretch">
    <div v-show="connected" class="rounded-2xl border border-black/25 p-4 dark:border-white/25">
      <div class="mb-4 border-b border-black/10 pb-4 dark:border-white/10">
        <div class="mb-2 text-xs font-semibold tracking-wide uppercase opacity-70">
          Device reboot
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="btn btn-outline px-4 py-1.5"
            :disabled="sideloading || rebooting"
            @click="reboot()"
          >
            {{ rebootingTarget === 'system' ? 'Rebooting…' : 'Reboot system' }}
          </button>
          <button
            class="btn btn-outline px-4 py-1.5"
            :disabled="sideloading || rebooting"
            @click="reboot('recovery')"
          >
            {{ rebootingTarget === 'recovery' ? 'Rebooting…' : 'Reboot recovery' }}
          </button>
          <button
            class="btn btn-outline px-4 py-1.5"
            :disabled="sideloading || rebooting"
            @click="reboot('bootloader')"
          >
            {{ rebootingTarget === 'bootloader' ? 'Rebooting…' : 'Reboot bootloader' }}
          </button>
        </div>
      </div>

      <div class="text-xs font-semibold tracking-wide uppercase opacity-70">Sideload</div>
      <div class="mb-2 flex flex-wrap text-sm">
        *Reboot to recovery and select
        <p class="px-2 font-mono">Apply update > Apply from ADB</p>
        before connecting.
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label class="btn btn-outline px-4 py-1.5">
          Choose ZIP
          <input
            ref="fileInput"
            type="file"
            accept=".zip,application/zip"
            class="hidden"
            @change="onFileSelected"
          />
        </label>
        <div class="min-w-0 flex-1">
          <div v-if="selectedFile" class="truncate text-sm font-medium">
            {{ selectedFile.name }}
          </div>
          <div v-else class="text-base-content/60 text-xs">No ZIP selected</div>
        </div>
        <button
          class="btn btn-primary px-4 py-1.5"
          :disabled="sideloading || rebooting || !selectedFile"
          @click="startSideload"
        >
          {{ sideloading ? 'Sideloading…' : 'Sideload' }}
        </button>
      </div>
    </div>
    <div v-show="!connected" class="mb-4 w-full text-center">
      <button class="btn btn-primary mx-auto px-4 py-1" @click="connect">Connect</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { AdbService } from '@/services/AdbService'

const connected = ref(false)
const sideloading = ref(false)
const rebooting = ref(false)
const rebootingTarget = ref<'system' | 'recovery' | 'bootloader' | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = useTemplateRef('fileInput')

const adbService = new AdbService()

const props = defineProps<{
  appendLog: (message: string) => void
  updateLastLog: (message: string) => void
}>()

onMounted(async () => {
  adbService.init()
  const adbObserver = await adbService.initObserver()
  adbObserver.onDeviceRemove(async (devices) => {
    for (const d of devices) {
      if (d.serial === adbService.deviceSerial) {
        await adbService.disconnect()
        connected.value = false
        props.appendLog(`Disconnected ${d.name} (${d.serial})`)
      }
    }
  })
})

onUnmounted(async () => {
  await adbService.disconnect()
  adbService.stopObserver()
  connected.value = false
})

async function connect() {
  try {
    const { name, serial } = await adbService.connect()
    connected.value = true
    props.appendLog(`Connected to ${name} (${serial})`)
  } catch (err) {
    let message = String(err)
    if (
      err instanceof Error &&
      err.message === 'The device is already in used by another program'
    ) {
      message += ' (try adb kill-server)'
    }
    props.appendLog(`Connection failed: ${message}`)
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function startSideload() {
  if (!selectedFile.value) return
  sideloading.value = true

  try {
    props.appendLog(`serving: '${selectedFile.value.name}'  (~0%)`)
    await adbService.sideload(selectedFile.value, (pct) => {
      props.updateLastLog(`serving: '${selectedFile.value!.name}'  (~${pct}%)`)
    })
    props.updateLastLog(`serving: '${selectedFile.value.name}'  (~100%)`)
    props.appendLog('Sideload complete!')
  } catch (err) {
    props.appendLog(`Sideload failed: ${String(err)}`)
  } finally {
    sideloading.value = false
    connected.value = false
    if (fileInput.value) fileInput.value.value = ''
    selectedFile.value = null
  }
}

async function reboot(target?: 'recovery' | 'bootloader') {
  if (sideloading.value || rebooting.value) return
  rebooting.value = true
  rebootingTarget.value = target ?? 'system'

  try {
    const label = target ?? 'system'
    props.appendLog(`Rebooting device to ${label}...`)
    await adbService.reboot(target)
    props.appendLog(`Reboot command sent (${label}).`)
  } catch (err) {
    props.appendLog(`Reboot failed: ${String(err)}`)
  } finally {
    rebooting.value = false
    rebootingTarget.value = null
    connected.value = false
  }
}
</script>
