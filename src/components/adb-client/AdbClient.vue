<template>
  <div class="order-1 flex-none grow-0 self-stretch">
    <div v-if="manager">
      <div v-show="connected" class="mb-4 justify-center">
        <div class="mt-2 flex items-center gap-3">
          <label class="btn cursor-pointer px-4 py-1">
            Choose ZIP
            <input
              ref="fileInput"
              type="file"
              accept=".zip,application/zip"
              class="hidden"
              @change="onFileSelected"
            />
          </label>
          <span v-if="selectedFile" class="truncate text-sm">{{ selectedFile.name }}</span>
        </div>

        <div v-if="selectedFile" class="mt-3">
          <button class="btn px-4 py-1" :disabled="sideloading" @click="startSideload">
            {{ sideloading ? 'Sideloading…' : 'Sideload' }}
          </button>
        </div>
      </div>
      <div v-show="!connected" class="mb-4 flex justify-center">
        <button class="btn px-4 py-1" @click="connect">Connect</button>
      </div>
    </div>
    <p v-else>Your browser does not support WebUSB! Please use a Chromium based browser.</p>
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
      props.updateLastLog(`serving: '${selectedFile.value!.name}'  (~${Math.round(pct)}%)`)
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

      onProgress((transmittedBytes / data.size) * 100 * 0.99)
    }
  } catch (err) {
    await socket.close()
    throw err
  }
  await socket.close()
}
</script>
