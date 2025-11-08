<template>
  <div class="flex h-full w-full flex-col">
    <div class="h-full w-full flex-grow overflow-auto">
      <div class="mx-auto min-w-0 max-w-[756px] px-8">
        <div class="flex flex-col items-start gap-4 px-6 py-10 sm:px-4">
          <h1 class="m-0 flex-none self-stretch text-3xl font-medium">Fastboot client</h1>
          <div class="order-1 flex-none flex-grow-0 self-stretch" v-show="webUsbSupported">
            <div class="mb-4 justify-center" v-show="connected">
              <textarea class="resize-none" cols="80" rows="20" ref="log"></textarea>

              <input class="hidden" type="file" ref="bootImage" @change="bootImageExec" />
              <input class="hidden" type="file" ref="flashImage" @change="flashImageExec" />

              <button class="btn mb-3 mr-3 px-4 py-1" @click="bootImage">Boot image</button>
              <button class="btn mb-3 mr-3 px-4 py-1" @click="flashImage">Flash image</button>
              <button class="btn mb-3 mr-3 px-4 py-1" @click="getVariable">Get variable</button>
              <button class="btn mb-3 mr-3 px-4 py-1" @click="rebootToRecovery">
                Reboot to recovery
              </button>
            </div>
            <div class="mb-4 flex justify-center" v-show="!connected">
              <button class="btn px-4 py-1" @click="connect">Connect</button>
            </div>
          </div>
          <p v-show="!webUsbSupported">Your browser does not support WebUSB!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as fastboot from 'android-fastboot'

export default {
  name: 'ErrorView',
  data() {
    return {
      connected: false,
      device: null,
      partition: '',
      webUsbSupported: navigator.usb !== undefined
    }
  },
  mounted() {
    this.device = new fastboot.FastbootDevice()

    fastboot.setDebugLevel(2 /* verbose */)
    fastboot.setDebugLogger((...data) => {
      console.log(...data)

      const log = this.$refs.log
      if (log.value.length > 0) {
        log.value += '\n'
      }
      log.value += [...data].join(' ')
      log.scrollTop = log.scrollHeight
    })
  },
  unmounted() {
    this.connected = false
    this.device = null
    this.partition = null
  },
  methods: {
    async connect() {
      try {
        await this.device.connect()

        this.$refs.log.value = ''
        this.connected = true

        await this.device.getVariable('product')
        await this.device.getVariable('serialno')
      } catch (err) {
        console.log(err)
        return
      }
    },
    async bootImage() {
      const input = this.$refs.bootImage
      input.click()
    },
    async bootImageExec(event) {
      await this.device.bootBlob(event.currentTarget.files[0])
    },
    async flashImage() {
      this.partition = window.prompt('Partition name (e.g. boot)', '')

      if (this.partition.length > 0) {
        const input = this.$refs.flashImage
        input.click()
      }
    },
    async flashImageExec(event) {
      await this.device.flashBlob(this.partition, 'current', event.currentTarget.files[0])
    },
    async getVariable() {
      const variable = window.prompt('Variable name (e.g. version-bootloader)', '')
      await this.device.getVariable(variable)
    },
    async rebootToRecovery() {
      await this.device.reboot('recovery')
      this.connected = false
    }
  }
}
</script>
