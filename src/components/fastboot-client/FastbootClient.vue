<template>
  <div v-show="webUsbSupported" class="order-1 flex-none grow-0 self-stretch">
    <div v-show="connected" class="mb-4 justify-center">
      <textarea
        ref="log"
        class="mb-2 w-full resize-none rounded-2xl border border-b border-solid border-black/25 bg-black p-6 font-mono md:p-4 dark:border-white/25"
        rows="16"
        readonly
      ></textarea>

      <div
        v-show="inputMode !== 'none'"
        class="mb-4 flex items-center rounded-2xl border border-solid border-black/25 bg-black px-6 md:px-4 dark:border-white/25"
      >
        <span class="font-mono text-white select-none">$</span>
        <input
          ref="inputRef"
          v-model="inputValue"
          class="w-full bg-transparent p-2 font-mono outline-none"
          type="text"
          :placeholder="inputPlaceholder"
          @keyup.enter="submitInput"
        />
      </div>

      <input ref="bootImageInput" class="hidden" type="file" @change="bootImageExec" />
      <input ref="flashImageInput" class="hidden" type="file" @change="flashImageExec" />
      <button class="btn mr-3 mb-3 px-4 py-1" @click="bootImage">Boot image</button>
      <button class="btn mr-3 mb-3 px-4 py-1" @click="promptFlashImage">Flash image</button>
      <button class="btn mr-3 mb-3 px-4 py-1" @click="promptGetVariable">Get variable</button>
      <button class="btn mr-3 mb-3 px-4 py-1" @click="rebootToRecovery">Reboot to recovery</button>
    </div>
    <div v-show="!connected" class="mb-4 flex justify-center">
      <button class="btn px-4 py-1" @click="connect">Connect</button>
    </div>
  </div>
  <p v-show="!webUsbSupported">
    Your browser does not support WebUSB! Please use a Chromium based browser.
  </p>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import * as fastboot from 'android-fastboot'

defineOptions({ name: 'FastbootView' })

const connected = ref(false)
const device = ref<fastboot.FastbootDevice | null>(null)
const partition = ref('')
const inputMode = ref<'none' | 'flash' | 'variable'>('none')
const inputValue = ref('')

const inputPlaceholder = computed(() => {
  if (inputMode.value === 'flash') return 'Partition name (e.g. boot)'
  if (inputMode.value === 'variable') return 'Variable name (e.g. version-bootloader)'
  return ''
})
// @ts-expect-error: Some browsers have WebUSB, do not enforce strict type check here
const webUsbSupported = typeof navigator !== 'undefined' && navigator.usb !== undefined

const log = useTemplateRef('log')
const bootImageInput = useTemplateRef('bootImageInput')
const flashImageInput = useTemplateRef('flashImageInput')
const inputRef = useTemplateRef('inputRef')

onMounted(() => {
  device.value = new fastboot.FastbootDevice()

  fastboot.setDebugLevel(2 /* verbose */)
  fastboot.setDebugLogger((...data) => {
    console.log(...data)

    if (!log.value) return

    if (log.value.value.length > 0) {
      log.value.value += '\n'
    }
    log.value.value += [...data].join(' ')
    log.value.scrollTop = log.value.scrollHeight
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

    if (log.value) {
      log.value.value = ''
    }
    connected.value = true

    await device.value?.getVariable('product')
    await device.value?.getVariable('serialno')
  } catch (err) {
    console.log(err)
  }
}

function bootImage() {
  bootImageInput.value?.click()
}

async function bootImageExec(event: Event) {
  const file = (event?.currentTarget as HTMLInputElement)?.files?.[0]
  if (!file) return
  await device.value?.bootBlob(file)
}

function promptFlashImage() {
  inputMode.value = 'flash'
  inputValue.value = ''
}

function promptGetVariable() {
  inputMode.value = 'variable'
  inputValue.value = ''
}

async function flashImageExec(event: Event) {
  const file = (event?.currentTarget as HTMLInputElement)?.files?.[0]
  if (!file || !partition.value) return
  await device.value?.flashBlob(partition.value, 'current', file)
}

function flashImage() {
  const value = inputValue.value.trim()
  if (!value) return
  partition.value = value
  inputMode.value = 'none'
  inputValue.value = ''
  flashImageInput.value?.click()
}

async function getVariable() {
  const value = inputValue.value.trim()
  if (!value) return
  inputMode.value = 'none'
  inputValue.value = ''
  await device.value?.getVariable(value)
}

async function submitInput() {
  if (inputMode.value === 'flash') {
    flashImage()
  } else if (inputMode.value === 'variable') {
    await getVariable()
  }
}

async function rebootToRecovery() {
  await device.value?.reboot('recovery')
  connected.value = false
}

watch(inputMode, async (mode) => {
  if (mode !== 'none') {
    await nextTick(() => inputRef.value?.focus())
  }
})
</script>
