<template>
  <div
    class="border-brand-primary/0 flex h-full w-full flex-col border"
    @dragover.prevent="fileDragOver"
    @dragleave.prevent="fileDragLeave"
    @drop.prevent="fileDropped"
  >
    <div class="w-full grow overflow-auto">
      <div class="mx-auto max-w-190 min-w-0 px-8">
        <div class="flex flex-col items-start gap-4 px-6 py-10 sm:px-4">
          <h1 class="m-0 flex-none self-stretch text-3xl font-medium">OTA Verifier</h1>
          <div class="order-1 flex-none self-stretch">
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
                class="text-brand-primary font-medium no-underline"
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

          <tbody v-if="payloadMetadata" class="[&_tr]:bg-[#d3d3d3]! dark:[&_tr]:bg-[#2c3034]!">
            <tr>
              <td>Payload Metadata</td>
              <td>
                <button
                  type="button"
                  class="text-brand-primary inline-flex cursor-pointer items-center gap-1 font-medium hover:underline"
                  @click="toggleMetadata"
                >
                  <span>{{ metadataExpanded ? 'Hide metadata' : 'View metadata' }}</span>
                  <MdiIcon
                    :path="mdiChevronRight"
                    class="text-xl transition-transform duration-150 ease-out"
                    :class="{ 'rotate-90': metadataExpanded }"
                  />
                </button>
              </td>
            </tr>
            <template v-if="metadataExpanded">
              <tr>
                <td
                  class="text-xs font-semibold tracking-wider text-black/60 uppercase dark:text-white/60"
                >
                  Partition
                </td>
                <td
                  class="text-xs font-semibold tracking-wider text-black/60 uppercase dark:text-white/60"
                >
                  SHA256 Hash
                </td>
              </tr>
              <tr v-for="item in partitions" :key="item.partitionName">
                <td>
                  <div>{{ item.partitionName }}</div>
                  <div
                    class="text-xs text-black/60 dark:text-white/60"
                    :title="
                      item.newPartitionInfo?.size
                        ? formatFileSize(item.newPartitionInfo.size, true)
                        : undefined
                    "
                  >
                    {{
                      item.newPartitionInfo?.size ? formatFileSize(item.newPartitionInfo.size) : '-'
                    }}
                  </div>
                </td>
                <td class="font-mono text-xs break-all">
                  {{ item.newPartitionInfo?.hash ? toHex(item.newPartitionInfo.hash) : '-' }}
                </td>
              </tr>
            </template>
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
          <input ref="input" class="hidden" type="file" @change="verifyFileInput" />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue'
import { DeltaArchiveManifest } from '@/ota/update_metadata'
import { useUiStore } from '@/stores/ui'
import CryptoService from '@/services/CryptoService'
import PayloadMetadataService from '@/services/PayloadMetadataService'
import type { SignInfo } from '@/services/CryptoService'
import { useSeoMeta } from '@unhead/vue'
import { mdiChevronRight } from '@mdi/js'
import MdiIcon from '@/components/mdi-icon/MdiIcon.vue'
import formatFileSize from '@/utils/formatFileSize'

useSeoMeta({
  title: 'OTA Verifier'
})
const store = useUiStore()
const input = useTemplateRef('input')
const payloadMetadata = ref<DeltaArchiveManifest | null>(null)
const metadataExpanded = ref(false)
const verifyResult = ref('')
const verifySignInfo = ref<SignInfo | null>(null)
const fileName = ref('')
const isVerified = ref(false)
const isVerifying = ref(false)

const partitions = computed(() =>
  [...(payloadMetadata.value?.partitions ?? [])].sort((a, b) =>
    a.partitionName.localeCompare(b.partitionName)
  )
)

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const toggleMetadata = () => {
  metadataExpanded.value = !metadataExpanded.value
}

const fileDragOver = (event: DragEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.classList.add(
      'bg-brand-primary/10!',
      'border-black/10',
      'dark:border-white/10'
    )
  }
}

const fileDragLeave = (event: DragEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.classList.remove(
      'bg-brand-primary/10!',
      'border-black/10',
      'dark:border-white/10'
    )
  }
}

const fileDropped = async (event: DragEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.classList.remove(
      'bg-brand-primary/10!',
      'border-black/10',
      'dark:border-white/10'
    )
  }
  if (event.dataTransfer?.files) {
    await verifyFile(event.dataTransfer.files[0])
  }
}

const formatDate = (dateStr: string | Date) => {
  let tempDate = new Date(dateStr)
  const offset = tempDate.getTimezoneOffset()
  tempDate = new Date(tempDate.getTime() - offset * 60 * 1000)
  return tempDate.toISOString().split('T')[0]
}

const verifyClicked = () => {
  if (input.value) {
    input.value.click()
  }
}

const verifyFile = async (blob?: File) => {
  if (!blob) {
    return
  }
  payloadMetadata.value = null
  metadataExpanded.value = false
  verifyResult.value = ''
  isVerifying.value = true
  try {
    const [result, metadata] = await Promise.all([
      CryptoService.verifyPackage(blob),
      PayloadMetadataService.readMetadataFromOta(blob)
    ])
    fileName.value = blob.name
    isVerified.value = result.status
    verifyResult.value = result.msg
    verifySignInfo.value = result.signInfo ?? null
    payloadMetadata.value = metadata
  } finally {
    isVerifying.value = false
  }
}

const verifyFileInput = async (event: Event) => {
  if (event.currentTarget instanceof HTMLInputElement) {
    await verifyFile(event.currentTarget.files?.[0])
  }
}

watch(isVerifying, (val) => {
  if (val) {
    store.startRequest()
  } else {
    store.endRequest()
  }
})
</script>
