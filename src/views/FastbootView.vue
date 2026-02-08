<template>
  <div class="flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <div class="mx-auto max-w-189 min-w-0 px-8">
        <div class="flex flex-col items-start gap-4 px-6 py-10 sm:px-4">
          <h1 class="m-0 flex-none self-stretch text-3xl font-medium">Fastboot client</h1>
          <div v-show="webUsbSupported" class="order-1 flex-none grow-0 self-stretch">
            <div v-show="connected" class="mb-4 justify-center">
              <textarea ref="log" class="resize-none" cols="80" rows="20"></textarea>

              <input ref="bootImage" class="hidden" type="file" @change="bootImageExec" />
              <input ref="flashImage" class="hidden" type="file" @change="flashImageExec" />

              <button class="btn mr-3 mb-3 px-4 py-1" @click="bootImage">Boot image</button>
              <button class="btn mr-3 mb-3 px-4 py-1" @click="flashImage">Flash image</button>
              <button class="btn mr-3 mb-3 px-4 py-1" @click="getVariable">Get variable</button>
              <button class="btn mr-3 mb-3 px-4 py-1" @click="rebootToRecovery">
                Reboot to recovery
              </button>
            </div>
            <div v-show="!connected" class="mb-4 flex justify-center">
              <button class="btn px-4 py-1" @click="connect">Connect</button>
            </div>
          </div>
          <p v-show="!webUsbSupported">Your browser does not support WebUSB!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import * as fastboot from 'android-fastboot'

defineOptions({ name: 'FastbootView' })

const connected = ref(false)
const device = ref<fastboot.FastbootDevice | null>(null)
const partition = ref('')
// @ts-expect-error: Some browsers have WebUSB, do not enforce strict type check here
const webUsbSupported = typeof navigator !== 'undefined' && navigator.usb !== undefined

const log = useTemplateRef('log')
const bootImageInput = useTemplateRef('bootImage')
const flashImageInput = useTemplateRef('flashImage')

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

function flashImage() {
  const promptValue = window.prompt('Partition name (e.g. boot)', '')
  partition.value = promptValue ?? ''

  if (partition.value.length > 0) {
    flashImageInput.value?.click()
  }
}

async function flashImageExec(event: Event) {
  const file = (event?.currentTarget as HTMLInputElement)?.files?.[0]
  if (!file || !partition.value) return
  await device.value?.flashBlob(partition.value, 'current', file)
}

async function getVariable() {
  const variable = window.prompt('Variable name (e.g. version-bootloader)', '')
  if (!variable) return
  await device.value?.getVariable(variable)
}

async function rebootToRecovery() {
  await device.value?.reboot('recovery')
  connected.value = false
}
</script>
