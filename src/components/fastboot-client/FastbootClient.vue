<template>
  <div class="order-1 flex-none grow-0 self-stretch">
    <Teleport to="#fastboot-input-footer" defer :disabled="!active">
      <div
        v-show="connected"
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
    <div v-show="connected" class="mb-4 justify-center">
      <!-- Action buttons -->
      <div class="flex flex-wrap">
        <button class="btn mr-3 mb-3 px-4 py-1" @click="bootImage">Boot image</button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptFlashImage">Flash image</button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="wipeSuper">Wipe super</button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptGetVariable">Get variable</button>
        <button v-show="abDevice" class="btn mr-3 mb-3 px-4 py-1" @click="promptSetActive">
          Set active slot
        </button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptReboot">Reboot</button>
        <button class="btn mr-3 mb-3 px-4 py-1" @click="promptRunCommand">Run command</button>
      </div>

      <!-- Hidden file inputs -->
      <input ref="bootImageInput" class="hidden" type="file" @change="bootImageExec" />
      <input ref="flashImageInput" class="hidden" type="file" @change="flashImageExec" />
      <input ref="wipeSuperInput" class="hidden" type="file" @change="wipeSuperExec" />
    </div>

    <div v-show="!connected" class="mb-4 w-full text-center">
      <button class="btn btn-primary mx-auto px-4 py-1" @click="connect">Connect</button>
      <div class="mt-3 flex justify-center text-sm">Reboot to fastboot before connecting.</div>
    </div>

    <!-- Confirmation dialog -->
    <ConfirmDialog
      :open="pendingConfirm !== null"
      :title="confirmTitle"
      :confirm-label="confirmLabel"
      @cancel="onCancel"
      @confirm="onConfirm"
    >
      <template v-if="pendingConfirm?.kind === 'flash'">
        <p>This will overwrite the current partition contents.</p>
      </template>
      <template v-else-if="pendingConfirm?.kind === 'wipe-super'">
        <p>All dynamic partitions will be erased.</p>
      </template>
      <template v-else-if="pendingConfirm?.kind === 'boot'">
        <p>No partitions are modified.</p>
      </template>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import * as fastboot from '@lineageos-infra/android-fastboot'
import ConfirmDialog from '@/components/utils/ConfirmDialog.vue'

defineOptions({ name: 'FastbootView' })

type Mode =
  | 'idle'
  | 'flash'
  | 'variable'
  | 'set-active'
  | 'reboot'
  | 'run-command'
  | 'awaiting-boot'
  | 'awaiting-flash'
  | 'awaiting-wipe-super'

type PendingConfirm =
  | { kind: 'boot'; file: File }
  | { kind: 'flash'; file: File; partition: string }
  | { kind: 'wipe-super'; file: File }

const connected = ref(false)
const device = ref<fastboot.FastbootDevice | null>(null)
const abDevice = ref<boolean>(false)
const partition = ref('')
const mode = ref<Mode>('idle')
const inputValue = ref('')
const isDragging = ref(false)
const pendingConfirm = ref<PendingConfirm | null>(null)

const isTextMode = computed(
  () =>
    mode.value === 'flash' ||
    mode.value === 'variable' ||
    mode.value === 'set-active' ||
    mode.value === 'reboot' ||
    mode.value === 'run-command'
)

const isAwaitingFile = computed(
  () =>
    mode.value === 'awaiting-boot' ||
    mode.value === 'awaiting-flash' ||
    mode.value === 'awaiting-wipe-super'
)

const inputPlaceholder = computed(() => {
  switch (mode.value) {
    case 'flash':
      return 'Partition name (e.g. boot)'
    case 'variable':
      return 'Variable name (e.g. version-bootloader)'
    case 'set-active':
      return 'Slot (a or b)'
    case 'reboot':
      return 'Reboot target (e.g. recovery)'
    case 'run-command':
      return 'Command (e.g. flashing unlock, oem unlock)'
    case 'awaiting-boot':
      return 'Drop boot image here, or click to browse...'
    case 'awaiting-flash':
      return `Drop image for partition "${partition.value}" here, or click to browse...`
    case 'awaiting-wipe-super':
      return 'Drop super_empty image here, or click to browse...'
    default:
      return 'Click an action below'
  }
})

const confirmTitle = computed(() => {
  const c = pendingConfirm.value
  switch (c?.kind) {
    case 'boot':
      return `Boot ${c.file.name}?`
    case 'flash':
      return `Flash ${c.file.name} to partition ${c.partition}?`
    case 'wipe-super':
      return `Wipe super using ${c.file.name}?`
    default:
      return ''
  }
})

const confirmLabel = computed(() => {
  switch (pendingConfirm.value?.kind) {
    case 'boot':
      return 'Boot'
    case 'flash':
      return 'Flash'
    case 'wipe-super':
      return 'Wipe super'
    default:
      return 'Confirm'
  }
})

const bootImageInput = useTemplateRef('bootImageInput')
const flashImageInput = useTemplateRef('flashImageInput')
const wipeSuperInput = useTemplateRef('wipeSuperInput')
const inputRef = useTemplateRef('inputRef')

const props = defineProps<{
  appendLog: (message: string) => void
  clearLog: () => void
  active: boolean
}>()

onMounted(() => {
  device.value = new fastboot.FastbootDevice()

  fastboot.setDebugLevel(2 /* verbose */)
  fastboot.setDebugLogger((...data) => {
    console.log(...data)
    props.appendLog([...data].join(' '))
  })
})

onUnmounted(() => {
  connected.value = false
  device.value = null
  partition.value = ''
})

async function connect() {
  try {
    await device.value?.connect()

    props.clearLog()
    connected.value = true

    void device.value?.waitForDisconnect().then(() => {
      connected.value = false
      mode.value = 'idle'
    })

    await device.value?.getVariable('product')
    await device.value?.getVariable('serialno')
    abDevice.value = (await device.value?.getSlot())?.length === 1
  } catch (err) {
    console.log(err)
  }
}

// Boot image
function bootImage() {
  mode.value = 'awaiting-boot'
}

function bootImageExec(event: Event) {
  const file = (event?.currentTarget as HTMLInputElement)?.files?.[0]
  if (!file) return
  stagePendingConfirm({ kind: 'boot', file })
}

async function confirmBoot() {
  const c = pendingConfirm.value
  if (c?.kind !== 'boot') return
  pendingConfirm.value = null
  mode.value = 'idle'
  await device.value?.bootBlob(c.file)
}

// Flash image
function promptFlashImage() {
  mode.value = 'flash'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

function flashImage() {
  const value = inputValue.value.trim()
  if (!value) return
  partition.value = value
  inputValue.value = ''
  mode.value = 'awaiting-flash'
}

function flashImageExec(event: Event) {
  const file = (event?.currentTarget as HTMLInputElement)?.files?.[0]
  if (!file || !partition.value) return
  stagePendingConfirm({ kind: 'flash', file, partition: partition.value })
}

async function confirmFlash() {
  const c = pendingConfirm.value
  if (c?.kind !== 'flash') return
  pendingConfirm.value = null
  partition.value = ''
  mode.value = 'idle'
  await device.value?.flashBlob(c.partition, 'current', c.file)
}

// Wipe super
function wipeSuper() {
  mode.value = 'awaiting-wipe-super'
}

function wipeSuperExec(event: Event) {
  const file = (event?.currentTarget as HTMLInputElement)?.files?.[0]
  if (!file) return
  stagePendingConfirm({ kind: 'wipe-super', file })
}

async function confirmWipe() {
  const c = pendingConfirm.value
  if (c?.kind !== 'wipe-super') return
  pendingConfirm.value = null
  mode.value = 'idle'
  await device.value?.wipeSuper(c.file, 'current')
}

// Get variable
function promptGetVariable() {
  mode.value = 'variable'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

async function getVariable() {
  const value = inputValue.value.trim()
  if (!value) return
  mode.value = 'idle'
  inputValue.value = ''
  await device.value?.getVariable(value)
}

// Set active
function promptSetActive() {
  mode.value = 'set-active'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

async function setActive() {
  const value = inputValue.value.trim()
  if (value !== 'a' && value !== 'b') return
  mode.value = 'idle'
  inputValue.value = ''
  await device.value?.runCommand(`set_active:${value}`)
}

// Reboot
function promptReboot() {
  mode.value = 'reboot'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

async function reboot() {
  const value = inputValue.value.trim()
  mode.value = 'idle'
  inputValue.value = ''
  if (value === '~recovery') {
    await device.value?.flashBlob('misc', 'current', new Blob(['boot-recovery']))
    await device.value?.reboot()
    return
  }
  await device.value?.reboot(value)
}

// Run command — strip 'fastboot ' prefix if user includes it
function promptRunCommand() {
  mode.value = 'run-command'
  inputValue.value = ''
  void nextTick(() => inputRef.value?.focus())
}

async function runCommand() {
  let value = inputValue.value.trim()
  if (!value) return
  value = value.replace(/^fastboot\s+/i, '')
  if (!value) return
  mode.value = 'idle'
  inputValue.value = ''
  await device.value?.runCommand(value)
}

async function submitInput() {
  switch (mode.value) {
    case 'flash':
      flashImage()
      break
    case 'variable':
      await getVariable()
      break
    case 'set-active':
      await setActive()
      break
    case 'reboot':
      await reboot()
      break
    case 'run-command':
      await runCommand()
      break
  }
}

// Confirm dialog helpers
function stagePendingConfirm(confirm: PendingConfirm) {
  pendingConfirm.value = confirm
}

function onCancel() {
  pendingConfirm.value = null
  mode.value = 'idle'
}

async function onConfirm() {
  switch (pendingConfirm.value?.kind) {
    case 'boot':
      await confirmBoot()
      break
    case 'flash':
      await confirmFlash()
      break
    case 'wipe-super':
      await confirmWipe()
      break
  }
}

// Pill click — open file picker in awaiting states
function onPillClick() {
  switch (mode.value) {
    case 'awaiting-boot':
      bootImageInput.value?.click()
      break
    case 'awaiting-flash':
      flashImageInput.value?.click()
      break
    case 'awaiting-wipe-super':
      wipeSuperInput.value?.click()
      break
  }
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
  switch (mode.value) {
    case 'awaiting-boot':
      stagePendingConfirm({ kind: 'boot', file })
      break
    case 'awaiting-flash':
      stagePendingConfirm({ kind: 'flash', file, partition: partition.value })
      break
    case 'awaiting-wipe-super':
      stagePendingConfirm({ kind: 'wipe-super', file })
      break
  }
}
</script>
