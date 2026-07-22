<template>
  <div class="order-1 flex-none self-stretch">
    <Teleport to="#amlogic-input-footer" defer :disabled="!active">
      <div
        v-show="ready"
        class="flex items-center border-t border-black/10 bg-gray-200 px-6 transition-colors md:px-4 dark:border-white/10 dark:bg-black"
        :class="{
          'bg-brand-primary/10! dark:bg-brand-primary/10!': isDragging,
          'cursor-pointer': isAwaitingFile
        }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="onPillClick"
      >
        <span
          class="font-mono select-none"
          :class="
            mode === 'idle'
              ? 'text-black/25 dark:text-white/25'
              : 'text-black/85 dark:text-white/85'
          "
          >$</span
        >
        <input
          ref="inputRef"
          v-model="inputValue"
          class="w-full bg-transparent p-2 font-mono outline-none"
          :class="
            isTextMode
              ? 'text-black/85 dark:text-white/85'
              : 'pointer-events-none text-black/40 dark:text-white/40'
          "
          type="text"
          :placeholder="inputPlaceholder"
          :disabled="!isTextMode"
          @keyup.enter="submitInput"
          @keyup.esc="mode = 'idle'"
        />
      </div>
    </Teleport>
    <div v-show="ready" class="mb-4 justify-center">
      <!-- Action buttons -->
      <div class="flex flex-wrap">
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptRunCommand">Run command</button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptFlashPackage">Flash package</button>
      </div>

      <!-- Hidden file input -->
      <input ref="flashInput" class="hidden" type="file" @change="flashExec" />
    </div>

    <div v-show="!connected" class="mb-4 w-full text-center">
      <button class="btn mx-auto px-4 py-1" @click="connect">Connect</button>
      <div class="mt-3 flex justify-center text-sm">Reboot to USB burn mode before connecting.</div>
    </div>

    <!-- Confirmation dialog -->
    <ConfirmDialog
      :open="pendingConfirm !== null"
      :title="confirmTitle"
      confirm-label="Flash"
      cancel-label="Cancel"
      @cancel="onCancel"
      @confirm="onConfirm"
    >
      <p>This will overwrite the device with the selected upgrade package.</p>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, shallowRef, useTemplateRef } from 'vue'
import {
  AmlImage,
  flashImage,
  reacquireDevice,
  ReacquireNeededError,
  requestDevice,
  WipeMode,
  type BurnProgress,
  type Device,
  type DeviceOptions
} from '@lineageos-infra/libamlburn'
import ConfirmDialog from '@/components/utils/ConfirmDialog.vue'
import formatFileSize from '@/utils/formatFileSize'

type Mode = 'idle' | 'command' | 'awaiting-flash'

const connected = ref(false)
const ready = ref(false)
// shallowRef: Device has private members that Vue's deep ref unwrap would strip
const device = shallowRef<Device | null>(null)
const mode = ref<Mode>('idle')
const inputValue = ref('')
const isDragging = ref(false)
const pendingConfirm = ref<{ file: File } | null>(null)

const flashInput = useTemplateRef('flashInput')
const inputRef = useTemplateRef('inputRef')

const props = defineProps<{
  appendLog: (message: string) => void
  updateLastLog: (message: string) => void
  clearLog: () => void
  active: boolean
}>()

const isTextMode = computed(() => mode.value === 'command')
const isAwaitingFile = computed(() => mode.value === 'awaiting-flash')

const inputPlaceholder = computed(() => {
  switch (mode.value) {
    case 'command':
      return 'Bulkcmd (e.g. printenv, fastboot)'
    case 'awaiting-flash':
      return 'Drop aml_install_package.img here, or click to browse...'
    default:
      return 'Click an action below'
  }
})

const confirmTitle = computed(() =>
  pendingConfirm.value ? `Flash ${pendingConfirm.value.file.name}?` : ''
)

onUnmounted(() => {
  connected.value = false
  ready.value = false
  device.value = null
})

async function connect() {
  try {
    const options: Partial<DeviceOptions> = {
      logging: false,
      timeout: 15000,
      logger: (_level, ...data) => props.appendLog(data.join(' '))
    }
    const dev = await requestDevice(options)
    await dev.initialize()

    props.clearLog()
    device.value = dev
    connected.value = true

    dev.onDisconnect(() => {
      connected.value = false
      ready.value = false
      device.value = null
      mode.value = 'idle'
    })

    const info = await dev.identify()
    props.appendLog(`Connected: ${info.toString()}`)
    ready.value = true
  } catch (err) {
    props.appendLog(String(err))
  }
}

// Run bulkcmd
function promptRunCommand() {
  mode.value = 'command'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

async function runCommand() {
  const value = inputValue.value.trim()
  if (!value) return
  mode.value = 'idle'
  inputValue.value = ''
  const dev = device.value
  if (!dev) return
  props.appendLog(`> ${value}`)
  try {
    const reply = await dev.checkBulkCmd(value)
    props.appendLog(reply || 'success')
  } catch (err) {
    // Some commands (e.g. "reboot bootloader") reset the device mid-command and are expected to fail
    props.appendLog(String(err))
  }
}

// Flash upgrade package
function promptFlashPackage() {
  mode.value = 'awaiting-flash'
}

function flashExec(event: Event) {
  const input = event?.currentTarget as HTMLInputElement
  if (!input) return
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  pendingConfirm.value = { file }
}

// Progress lines are overwritten in place per stage/partition rather than appended
const progressKey = ref('')

function onProgress(p: BurnProgress) {
  const parts: string[] = [p.stage]
  if (p.partition) parts.push(p.partition)
  if (p.bytesTransferred !== undefined && p.totalBytes !== undefined) {
    parts.push(`${formatFileSize(p.bytesTransferred)} / ${formatFileSize(p.totalBytes)}`)
  }
  const line = parts.join(' ')
  const key = `${p.stage}:${p.partition ?? ''}`
  if (key === progressKey.value) {
    props.updateLastLog(line)
  } else {
    progressKey.value = key
    props.appendLog(line)
  }
}

async function confirmFlash() {
  const c = pendingConfirm.value
  if (!c) return
  pendingConfirm.value = null
  mode.value = 'idle'
  const dev = device.value
  if (!dev) return
  try {
    props.appendLog(`Opening ${c.file.name}...`)
    const image = await AmlImage.open(c.file)
    progressKey.value = ''
    // flashImage may return a new handle — the device re-enumerates mid-flash
    const finished = await flashImage(dev, image, {
      wipe: WipeMode.None,
      reboot: true,
      onProgress,
      reacquire: async () => {
        try {
          return await reacquireDevice(5000, { timeout: 15000 })
        } catch (err) {
          if (!(err instanceof ReacquireNeededError)) throw err
          props.appendLog('Device re-enumerated — please re-select it in the browser prompt.')
          return await requestDevice()
        }
      }
    })
    device.value = finished
    props.appendLog('Flash complete.')
  } catch (err) {
    props.appendLog(String(err))
  }
}

function submitInput() {
  if (mode.value === 'command') void runCommand()
}

function onCancel() {
  pendingConfirm.value = null
  mode.value = 'idle'
}

async function onConfirm() {
  await confirmFlash()
}

// Pill click — open file picker while awaiting a file
function onPillClick() {
  if (mode.value === 'awaiting-flash') flashInput.value?.click()
}

// Drag and drop
function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (!isAwaitingFile.value) return
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  pendingConfirm.value = { file }
}
</script>
