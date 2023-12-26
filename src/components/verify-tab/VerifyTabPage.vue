<template>
  <div
      class="tab-page verify-tab-page"
      @dragover.prevent="fileDragOver"
      @dragleave.prevent="fileDragLeave"
      @drop.prevent="fileDropped"
  >
    <table v-if="verifyResult">
      <tr>
        <th colspan="2" :class="{ 'bg-red': !isVerified }">
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
        <td>{{ verifySignInfo.publicKeyFingerprint }}</td>
      </tr>
      <tr v-if="verifySignInfo?.serialNumber">
        <td>Serial Number</td>
        <td>{{ verifySignInfo.serialNumber }}</td>
      </tr>
      <tr v-if="verifySignInfo?.validity">
        <td>Validity</td>
        <td>
          From {{ formatDate(verifySignInfo.validity.notBefore) }} to {{ formatDate(verifySignInfo.validity.notAfter) }}
        </td>
      </tr>
    </table>
    <a href="#" class="verify-icon" @click="verifyClicked">Verify OTA package signature</a>
    <form>
      <input type="file" ref="inputRef" @change="verifyFileInput" style="display: none;" />
    </form>
  </div>
</template>

<script>
import CryptoService from '../../js/CryptoService';

export default {
  name: 'VerifyTabPage',
  data: () => ({
    verifyResult: "",
    verifySignInfo: null,
    fileName: "",
    isVerified: false,
  }),
  methods: {
    fileDragOver(event) {
      event.currentTarget.classList.add('dragover-border');
    },
    fileDragLeave(event) {
      event.currentTarget.classList.remove('dragover-border');
    },
    fileDropped(event) {
      event.currentTarget.classList.remove('dragover-border');
      this.verifyFile(event.dataTransfer.files[0]);
    },
    formatDate(dateStr) {
      let tempDate = new Date(dateStr)
      const offset = tempDate.getTimezoneOffset()
      tempDate = new Date(tempDate.getTime() - (offset*60*1000))
      return tempDate.toISOString().split('T')[0]
    },
    verifyClicked() {
      const input = this.$refs.inputRef;
      input.click();
    },
    verifyFile(blob) {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const result = await CryptoService.verifyPackage(fileReader.result);
        this.isVerified = result.status;
        this.verifyResult = result.msg;
        this.verifySignInfo = result.signInfo;
      };
      fileReader.readAsArrayBuffer(blob);
      this.fileName = blob.name;
    },
    verifyFileInput(event) {
      this.verifyFile(event.currentTarget.files[0]);
    },
  }
}
</script>

<style scoped>
@import '../../css/tab-page.css';
@import '../../css/table.css';

.verify-tab-page {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.verify-icon {
  display: flex !important;
  flex-direction: row;
  align-items: center;
  padding: 4px 16px;
  gap: 10px;
  background: #CCE8E9;
  color: #000;
  text-decoration: none;
  border-radius: 16px;
  height: 32px;
  justify-content: center;
  transition: background 0.125s ease-out;
}

#app.dark .verify-icon {
  background: #324B4C !important;
  color: #CCE8E9 !important;
}

@media (hover: hover), (-moz-touch-enabled: 0) {
  .verify-icon:hover {
    background: #167c80 !important;
  }

  #app.dark .verify-icon:hover {
    background: #167c80 !important;
  }
}

.bg-red {
  background-color: #f8d7da !important;
}

#app.dark .bg-red {
  background-color: #522b2a !important;
  color: #f8d7da !important;
}

.dragover-border {
  border: 2px dashed #167c80;
}
</style>
