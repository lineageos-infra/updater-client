<template>
  <collapsible-item class="downloadable">
    <template v-slot:title="{ isExpanded, toggleManualExpansion }">
      <div
        class="title-container"
        v-bind:class="{
          expanded: isExpanded
        }"
      >
        <div class="title">
          {{ name || filename }}
        </div>
        <div class="controls">
          <a :href="url" class="btn px-5 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-brand-dark dark:text-brand-light hover:text-white hover:transition hover:duration-150 hover:ease-out"
            >
              <path
                d="M2 16C1.45 16 0.979333 15.8043 0.588 15.413C0.196 15.021 0 14.55 0 14V11H2V14H14V11H16V14C16
              14.55 15.8043 15.021 15.413 15.413C15.021 15.8043 14.55 16 14 16H2ZM8 12L3 7L4.4 5.55L7 8.15V0H9V8.15L11.6 5.55L13 7L8 12Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <i
            class="mdi icon expand-icon hover:bg-dark/15 opacity-55 dark:opacity-55 dark:hover:bg-white/15"
            :class="{ 'mdi-information': isExpanded, 'mdi-information-outline': !isExpanded }"
            v-on:click="toggleManualExpansion"
          ></i>
        </div>
      </div>
    </template>
    <template v-slot:content>
      <div class="details-wrapper rounded-md dark:bg-white/5">
        <div class="details">
          <span class="details-title">Details</span>
          <downloadable-detail title="Date" v-if="date" v-bind:value="date"></downloadable-detail>
          <downloadable-detail
            title="OS patch level"
            v-if="osPatchLevelHuman"
            v-bind:value="osPatchLevelHuman"
          ></downloadable-detail>
          <downloadable-detail title="Type" v-if="type" v-bind:value="type"></downloadable-detail>
          <downloadable-detail
            title="Size"
            v-if="sizeHuman"
            v-bind:value="sizeHuman"
          ></downloadable-detail>
          <downloadable-detail
            title="SHA256"
            v-if="sha256"
            v-bind:value="sha256"
          ></downloadable-detail>
        </div>
      </div>
    </template>
  </collapsible-item>
</template>

<script>
import CollapsibleItem from '../utils/CollapsibleItem.vue'
import DownloadableDetail from './DownloadableDetail.vue'

export default {
  name: 'DownloadableItem',
  components: {
    CollapsibleItem,
    DownloadableDetail
  },
  props: {
    date: String,
    datetime: Number,
    filename: String,
    filepath: String,
    name: String,
    os_patch_level: String,
    sha256: String,
    size: Number,
    type: String,
    url: String,
    version: String
  },
  computed: {
    osPatchLevelHuman() {
      if (typeof this.os_patch_level === 'string') {
        return new Date(this.os_patch_level).toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC'
        })
      }
      return ''
    },
    sizeHuman() {
      if (this.size !== undefined) {
        const units = {
          GiB: 3,
          MiB: 2,
          KiB: 1
        }

        for (const [unit, exponent] of Object.entries(units)) {
          if (this.size >= Math.pow(1024, exponent)) {
            return `${(this.size / Math.pow(1024, exponent)).toFixed(2)} ${unit}`
          }
        }

        return `${this.size} B`
      }
      return ''
    }
  }
}
</script>

<style scoped>
.downloadable {
  line-height: 24px;
  vertical-align: center;
}

.downloadable .title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.downloadable .title-container .controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.downloadable .title-container .controls .icon {
  display: block;
  flex-shrink: 0;

  font-size: 24px;
  line-height: 36px;
  height: 36px;
  width: 36px;
  text-align: center;
  border-radius: 50%;

  transition: background 0.125s ease-out;

  cursor: pointer;

  user-select: none; /* prevent automatic selection of the details contents */
}

.downloadable .details {
  line-height: 24px;
  padding: 16px;
  border-radius: 4px;

  font-size: 14px;

  background: rgba(0, 0, 0, 0.05);

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.downloadable .details .details-title {
  display: flex;
  line-height: 150%;
}
</style>
