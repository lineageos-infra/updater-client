<template>
  <div
    class="w-full h-full flex flex-col border-2 border-dashed border-brand-primary border-opacity-0"
    @dragover.prevent="fileDragOver"
    @dragleave.prevent="fileDragLeave"
    @drop.prevent="fileDropped"
  >
    <div class="flex-grow w-full h-full overflow-auto" data-simplebar>
      <div class="min-w-0 max-w-[756px] mx-auto px-8">
        <div class="flex flex-col items-start py-10 px-6 sm:px-4 gap-4">
          <h1 class="flex-none self-stretch text-3xl m-0 font-medium">OTA Verifier</h1>
          <div class="flex-none order-1 self-stretch flex-grow-0">
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
                class="no-underline font-medium text-brand-primary"
              >
                Verifying Build Authenticity
              </a>
              guide.
            </p>
          </div>
        </div>
        <table v-if="verifyResult" class="text-left">
          <tr class="text-center">
            <th
              colspan="2"
              :class="{
                'bg-[#f8d7da] dark:bg-[#522b2a] dark:text-[#f8d7da] font-medium': !isVerified
              }"
            >
              {{ verifyResult }}
            </th>
          </tr>
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
        </table>
        <div class="flex justify-center mb-4">
          <button class="btn px-4 py-1" @click="verifyClicked" :disabled="verifying">{{ verifying ? "Verifying, please wait..." : "Verify OTA package signature" }}</button>
        </div>
        <form>
          <input class="hidden" type="file" ref="inputRef" @change="verifyFileInput" />
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
    verifying: false,
    isVerified: false
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
      const input = this.$refs.inputRef
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
        this.verifying = false
      }
      this.verifying = true
      fileReader.onloadstart = () => store.commit('startRequest')
      fileReader.onloadend = () => store.commit('endRequest')
      fileReader.readAsArrayBuffer(blob)
    },
    verifyFileInput(event) {
      this.verifyFile(event.currentTarget.files[0])
    }
  }
}
</script>
