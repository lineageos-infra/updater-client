<template>
  <div class="order-1 flex-none self-stretch">
    <Teleport to="#odin-input-footer" defer :disabled="!active">
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
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptFlashImage">Flash partition</button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="reboot">Reboot</button>
      </div>

      <!-- Hidden file input -->
      <input ref="flashImageInput" class="hidden" type="file" @change="flashImageExec" />
    </div>

    <div v-show="!connected" class="mb-4 w-full text-center">
      <button class="btn mx-auto px-4 py-1" @click="connect">Connect</button>
      <div class="mt-3 flex justify-center text-sm">Reboot to download mode before connecting.</div>
      <div class="mt-2 flex justify-center gap-2 text-xs text-black/60 dark:text-white/70">
        <span>Using {{ transportLabel }}</span>
        <button class="cursor-pointer underline" @click="toggleTransport">
          Use {{ altTransportLabel }} instead
        </button>
      </div>
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
      <p>This will overwrite the current partition contents.</p>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import libmjolnir, { OdinDevice, libpit, type DeviceOptions } from '@lineageos-infra/libmjolnir'
import ConfirmDialog from '@/components/utils/ConfirmDialog.vue'
import formatFileSize from '@/utils/formatFileSize'

type Mode = 'idle' | 'flash' | 'awaiting-flash'

const connected = ref(false)
const ready = ref(false)
const device = ref<OdinDevice | null>(null)
const transport = ref<'webusb' | 'webserial'>(isWindows() ? 'webserial' : 'webusb')
const partition = ref('')
const mode = ref<Mode>('idle')
const inputValue = ref('')
const isDragging = ref(false)
const pendingConfirm = ref<{ file: File; partition: string } | null>(null)
const devicePit = ref<libpit.PitData | null>(null)

// Partition names are mostly upper-case in the PIT; mirror that as the user types
watch(inputValue, (value) => {
  const upper = value.toUpperCase()
  if (upper !== value) inputValue.value = upper
})

const flashImageInput = useTemplateRef('flashImageInput')
const inputRef = useTemplateRef('inputRef')

const props = defineProps<{
  appendLog: (message: string) => void
  clearLog: () => void
  active: boolean
}>()

const isTextMode = computed(() => mode.value === 'flash')
const isAwaitingFile = computed(() => mode.value === 'awaiting-flash')

const transportLabel = computed(() => (transport.value === 'webusb' ? 'WebUSB' : 'Web Serial'))
const altTransportLabel = computed(() => (transport.value === 'webusb' ? 'Web Serial' : 'WebUSB'))

function toggleTransport() {
  transport.value = transport.value === 'webusb' ? 'webserial' : 'webusb'
}

const inputPlaceholder = computed(() => {
  switch (mode.value) {
    case 'flash':
      return 'Partition name (e.g. RECOVERY)'
    case 'awaiting-flash':
      return `Drop image for "${partition.value}" here, or click to browse...`
    default:
      return 'Click an action below'
  }
})

const confirmTitle = computed(() => {
  const c = pendingConfirm.value
  return c ? `Flash ${c.file.name} to partition ${c.partition}?` : ''
})

onUnmounted(() => {
  connected.value = false
  ready.value = false
  device.value = null
  partition.value = ''
  devicePit.value = null
})

// WebUSB on Linux/macOS, Web Serial on Windows (no WinUSB driver swap needed)
function isWindows() {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent
  return /win/i.test(platform)
}

async function connect() {
  try {
    const options: Partial<DeviceOptions> = {
      logging: false,
      timeout: 15000,
      logger: (_level, ...data) => props.appendLog([...data].join(' '))
    }
    const dev =
      transport.value === 'webserial'
        ? await libmjolnir.requestSerialDevice(options)
        : await libmjolnir.requestDevice(options)
    await dev.initialize()

    props.clearLog()
    device.value = dev
    connected.value = true

    dev.onDisconnect(() => {
      connected.value = false
      ready.value = false
      device.value = null
      devicePit.value = null
      mode.value = 'idle'
    })

    await printPit()
    ready.value = true
  } catch (err) {
    props.appendLog(String(err))
  }
}

function formatPit(pit: libpit.PitData) {
  const lines = [`PIT — board: ${pit.boardType}`]
  for (const entry of pit.entries) {
    if (!entry.isFlashable) continue
    const flashName =
      entry.flashFilename && entry.flashFilename !== '-' ? ` (${entry.flashFilename})` : ''
    const size = formatFileSize(entry.partitionSize)
    lines.push(`  [${entry.identifier}] ${entry.partitionName}${flashName} — ${size}`)
  }
  return lines.join('\n')
}

async function printPit() {
  const dev = device.value
  if (!dev) return
  await dev.beginSession()
  const pit = await dev.getPitData()
  devicePit.value = pit
  props.appendLog(formatPit(pit))
}

// Flash partition
function promptFlashImage() {
  mode.value = 'flash'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

function flashImage() {
  const value = inputValue.value.trim().toUpperCase()
  if (!value) return
  const entry = devicePit.value?.entries.find(
    (e) => e.isFlashable && e.partitionName.toUpperCase() === value
  )
  if (!entry) {
    props.appendLog(`Unknown partition "${value}".`)
    return
  }
  partition.value = entry.partitionName
  inputValue.value = ''
  mode.value = 'awaiting-flash'
}

function flashImageExec(event: Event) {
  const input = event?.currentTarget as HTMLInputElement
  if (!input) return
  const file = input.files?.[0]
  input.value = ''
  if (!file || !partition.value) return
  pendingConfirm.value = { file, partition: partition.value }
}

async function confirmFlash() {
  const c = pendingConfirm.value
  if (!c) return
  pendingConfirm.value = null
  partition.value = ''
  mode.value = 'idle'
  props.appendLog(`${c.partition} upload start`)
  await device.value?.flashPartition(c.partition, c.file)
  props.appendLog(`${c.partition} upload successful`)
}

// Reboot
async function reboot() {
  await device.value?.reboot()
}

function submitInput() {
  if (mode.value === 'flash') flashImage()
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
  if (mode.value === 'awaiting-flash') flashImageInput.value?.click()
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
  pendingConfirm.value = { file, partition: partition.value }
}
</script>
