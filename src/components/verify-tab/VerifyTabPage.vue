<template>
  <div
    class="w-full h-full flex flex-col verify-tab-page"
    @dragover.prevent="fileDragOver"
    @dragleave.prevent="fileDragLeave"
    @drop.prevent="fileDropped"
  >
    <div class="flex-grow w-full h-full overflow-auto" data-simplebar>
      <div class="min-w-0 max-w-[756px] mx-auto px-8">
        <div class="header">
          <h1>OTA Verifier</h1>
          <div>
            <p>
              You can verify that your downloaded builds are signed with LineageOS private keys and
              are untampered by either dragging and dropping a file here or using the button
              below.<br />
              NOTE: Verification only works for OTA packages (lineage-*.zip) and is performed
              locally in your browser.
            </p>
            <p>
              For manual verification, check our
              <a href="https://wiki.lineageos.org/verifying-builds.html" target="_blank"
                >Verifying Build Authenticity</a
              >
              guide.
            </p>
          </div>
        </div>
        <table v-if="verifyResult" class="text-left">
          <tr class="text-center">
            <th colspan="2" :class="{ 'bg-error': !isVerified }">
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
            <td style="word-break: break-all">{{ verifySignInfo.publicKeyFingerprint }}</td>
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
        <div class="flex justify-center">
          <button class="btn px-4 py-1" @click="verifyClicked">Verify OTA package signature</button>
        </div>
        <form>
          <input type="file" ref="inputRef" @change="verifyFileInput" style="display: none" />
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
    isVerified: false
  }),
  methods: {
    fileDragOver(event) {
      event.currentTarget.classList.add('dragover-border')
    },
    fileDragLeave(event) {
      event.currentTarget.classList.remove('dragover-border')
    },
    fileDropped(event) {
      event.currentTarget.classList.remove('dragover-border')
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
      }
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

<style scoped>
.bg-error {
  @apply bg-[#f8d7da] dark:bg-[#522b2a] dark:text-[#f8d7da];
}

.dragover-border {
  border: 2px dashed #167c80;
}

.verify-tab-page .header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px 24px;
  gap: 16px;
}

.verify-tab-page .header h1 {
  flex: none;
  align-self: stretch;
  font-size: 32px;
  line-height: 38px;
  margin: 0;
  font-weight: 500;
}

.verify-tab-page .header p {
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

.verify-tab-page .header a {
  color: #167c80;
  text-decoration: none;
  font-weight: 500;
}

@media (max-width: 479px) {
  .verify-tab-page .header {
    padding: 40px 16px;
  }
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
