<template>
  <div
    class="flex h-full w-full flex-col border-2 border-dashed border-brand-primary border-opacity-0"
    @dragover.prevent="fileDragOver"
    @dragleave.prevent="fileDragLeave"
    @drop.prevent="fileDropped"
  >
    <div class="h-full w-full flex-grow overflow-auto">
      <div class="mx-auto min-w-0 max-w-[756px] px-8">
        <div class="flex flex-col items-start gap-4 px-6 py-10 sm:px-4">
          <h1 class="m-0 flex-none self-stretch text-3xl font-medium">OTA Verifier</h1>
          <div class="order-1 flex-none flex-grow-0 self-stretch">
            <p>
              You can use your browser to verify that downloaded OTA packages (lineage-*.zip) are
              signed with LineageOS private keys and are untampered. Drag a file here or use the
              button below.
            </p>
            <p>
              For manual verification, check our
              <a
                href="https://wiki.lineageos.org/verifying-builds.html"
                target="_blank"
                class="font-medium text-brand-primary no-underline"
              >
                Verifying Build Authenticity
              </a>
              guide.
            </p>
          </div>
        </div>
        <table v-if="verifyResult" class="text-left">
          <thead>
            <tr class="text-center">
              <th
                colspan="2"
                :class="{
                  'bg-[#f8d7da] font-medium dark:bg-[#522b2a] dark:text-[#f8d7da]': !isVerified
                }"
              >
                {{ verifyResult }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>File Name</td>
              <td>{{ fileName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.commonName">
              <td>Common Name</td>
              <td>{{ verifySignInfo.commonName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.organizationalUnitName">
              <td>Organizational Unit</td>
              <td>{{ verifySignInfo.organizationalUnitName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.organizationName">
              <td>Organization</td>
              <td>{{ verifySignInfo.organizationName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.localityName">
              <td>Locality</td>
              <td>{{ verifySignInfo.localityName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.stateOrProvinceName">
              <td>State or Province Name</td>
              <td>{{ verifySignInfo.stateOrProvinceName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.countryName">
              <td>Country Name</td>
              <td>{{ verifySignInfo.countryName }}</td>
            </tr>
            <tr v-if="verifySignInfo?.publicKeyFingerprint">
              <td>Public Key Fingerprint</td>
              <td class="break-all">{{ verifySignInfo.publicKeyFingerprint }}</td>
            </tr>
            <tr v-if="verifySignInfo?.serialNumber">
              <td>Serial Number</td>
              <td>{{ verifySignInfo.serialNumber }}</td>
            </tr>
            <tr v-if="verifySignInfo?.validity">
              <td>Validity</td>
              <td>
                From {{ formatDate(verifySignInfo.validity.notBefore) }} to
                {{ formatDate(verifySignInfo.validity.notAfter) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mb-4 flex justify-center">
          <button
            class="btn px-4 py-1"
            :class="{ 'opacity-50': isVerifying }"
            :disabled="isVerifying"
            @click="verifyClicked"
          >
            Verify OTA package signature
          </button>
        </div>
        <form>
          <input class="hidden" type="file" ref="input" @change="verifyFileInput" />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoService from '../../js/CryptoService'
import store from './../../store'

export default {
  name: 'VerifyTabPage',
  data: () => ({
    verifyResult: '',
    verifySignInfo: null,
    fileName: '',
    isVerified: false,
    isVerifying: false
  }),
  methods: {
    fileDragOver(event) {
      event.currentTarget.classList.remove('border-opacity-0')
    },
    fileDragLeave(event) {
      event.currentTarget.classList.add('border-opacity-0')
    },
    fileDropped(event) {
      event.currentTarget.classList.add('border-opacity-0')
      this.verifyFile(event.dataTransfer.files[0])
    },
    formatDate(dateStr) {
      let tempDate = new Date(dateStr)
      const offset = tempDate.getTimezoneOffset()
      tempDate = new Date(tempDate.getTime() - offset * 60 * 1000)
      return tempDate.toISOString().split('T')[0]
    },
    verifyClicked() {
      const input = this.$refs.input
      input.click()
    },
    verifyFile(blob) {
      const fileReader = new FileReader()
      fileReader.onload = async () => {
        const result = await CryptoService.verifyPackage(new Uint8Array(fileReader.result))
        this.fileName = blob.name
        this.isVerified = result.status
        this.verifyResult = result.msg
        this.verifySignInfo = result.signInfo
      }
      fileReader.onloadstart = () => (this.isVerifying = true)
      fileReader.onloadend = () => (this.isVerifying = false)
      fileReader.readAsArrayBuffer(blob)
    },
    verifyFileInput(event) {
      this.verifyFile(event.currentTarget.files[0])
    }
  },
  watch: {
    isVerifying: function (val) {
      if (val) {
        store.commit('startRequest')
      } else {
        store.commit('endRequest')
      }
    }
  }
}
</script>
