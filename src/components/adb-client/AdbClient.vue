<template>
  <div class="order-1 flex-none grow-0 self-stretch">
    <div v-show="connected" class="rounded-2xl border border-black/25 p-4 dark:border-white/25">
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
          :disabled="sideloading || !selectedFile"
          @click="startSideload"
        >
          {{ sideloading ? 'Sideloading…' : 'Sideload' }}
        </button>
      </div>
    </div>
    <div v-show="!connected" class="mb-4 w-full text-center">
      <button class="btn btn-primary mx-auto px-4 py-1" @click="connect">Connect</button>
      <div class="mt-3 flex flex-wrap justify-center text-sm">
        Reboot to recovery and select
        <p class="px-2 font-mono">Apply update > Apply from ADB</p>
        before connecting.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, useTemplateRef } from 'vue'
import { AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb'
import AdbWebCredentialStore from '@yume-chan/adb-credential-web'
import { Adb, AdbDaemonTransport, type AdbDaemonDevice } from '@yume-chan/adb'

const connected = ref(false)
const sideloading = ref(false)
const selectedFile = ref<File | null>(null)

const manager = shallowRef<AdbDaemonWebUsbDeviceManager | undefined>(undefined)
const device = shallowRef<AdbDaemonDevice | undefined>(undefined)
const adb = shallowRef<Adb | undefined>(undefined)

const CredentialStore = new AdbWebCredentialStore()

onMounted(() => {
  manager.value = AdbDaemonWebUsbDeviceManager.BROWSER
})

const fileInput = useTemplateRef('fileInput')
const props = defineProps<{
  appendLog: (message: string) => void
  updateLastLog: (message: string) => void
}>()

onUnmounted(async () => {
  if (adb.value) {
    await adb.value.close()
  }
  connected.value = false
  manager.value = undefined
  adb.value = undefined
})

async function connect() {
  try {
    device.value = await manager.value?.requestDevice()
    if (!device.value) return
    const connection = await device.value.connect()

    const transport = await AdbDaemonTransport.authenticate({
      serial: device.value.serial,
      connection,
      credentialStore: CredentialStore
    })

    adb.value = new Adb(transport)

    connected.value = true
    props.appendLog(`Connected to ${device.value.name} (${device.value.serial})`)
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === 'The device is already in used by another program'
    ) {
      err.message += ' (try adb kill-server)'
    }

    props.appendLog(`Connection failed: ${err as string}`)
    console.error(err)
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function startSideload() {
  if (!adb.value || !selectedFile.value) return

  sideloading.value = true

  try {
    props.appendLog(`serving: '${selectedFile.value.name}'  (~0%)`)
    await adbSideload(adb.value, selectedFile.value, (pct) => {
      props.updateLastLog(`serving: '${selectedFile.value!.name}'  (~${pct}%)`)
    })
    props.updateLastLog(`serving: '${selectedFile.value.name}'  (~100%)`)
    props.appendLog('Sideload complete!')
  } catch (err) {
    props.appendLog(`Sideload failed: ${err as string}`)
    console.error(err)
  } finally {
    sideloading.value = false
    // Reset file input so the same file can be re-selected
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    selectedFile.value = null
  }
}

const ADB_EXIT_SUCCESS = 'DONEDONE'
const ADB_EXIT_FAILURE = 'FAILFAIL'
const ADB_SIDELOAD_CHUNK_SIZE = 65536

async function adbSideload(
  device: Adb,
  data: Blob,
  onProgress: (percentage: number) => void = () => {}
) {
  const socket = await device.createSocket(`sideload-host:${data.size}:${ADB_SIDELOAD_CHUNK_SIZE}`)
  const reader = socket.readable.getReader()
  const writer = socket.writable.getWriter()

  try {
    let transmittedBytes = 0
    while (true) {
      const res = await reader.read()
      if (res.done) {
        throw new Error('reader unexpectedly ended')
      }
      const decoder = new TextDecoder('ascii')
      const resStr = decoder.decode(res.value)
      if (resStr == ADB_EXIT_SUCCESS) {
        break
      } else if (resStr == ADB_EXIT_FAILURE) {
        throw new Error('sideload failed')
      }
      const requestedBlock = parseInt(resStr)
      const offset = requestedBlock * ADB_SIDELOAD_CHUNK_SIZE
      if (offset > data.size) {
        throw new Error(
          `adb: failed to read block ${requestedBlock} at offset ${offset}, past end ${data.size}`
        )
      }

      const end = Math.min(offset + ADB_SIDELOAD_CHUNK_SIZE, data.size)
      const chunk = data.slice(offset, end)
      await writer.write(new Uint8Array(await chunk.arrayBuffer()))

      transmittedBytes += chunk.size

      onProgress(Math.floor((transmittedBytes / data.size) * 100))
    }
  } catch (err) {
    await socket.close()
    connected.value = false
    throw err
  }
  await socket.close()
  connected.value = false
}
</script>
