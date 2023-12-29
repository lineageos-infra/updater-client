<template>
  <collapsible-item
    class="oem border-b border-solid border-black dark:border-white border-opacity-15 dark:border-opacity-15"
    v-bind:forceExpanded="forceExpanded"
    v-show="!hidden"
  >
    <template v-slot:title="{ isExpanded, toggleManualExpansion }">
      <div
        class="title-container"
        v-on:click="toggleManualExpansion"
        v-bind:class="{
          expanded: isExpanded
        }"
      >
        <span class="title">
          {{ name }}
        </span>
        <i class="mdi mdi-chevron-down icon opacity-35" v-if="!forceExpanded"> </i>
      </div>
    </template>
    <template v-slot:content>
      <div class="devices-container">
        <div class="devices">
          <template v-for="device in devices" :key="device.model">
            <device-item v-bind="device"></device-item>
          </template>
        </div>
      </div>
    </template>
  </collapsible-item>
</template>

<script>
import CollapsibleItem from '../utils/CollapsibleItem.vue'
import DeviceItem from './DeviceItem.vue'

export default {
  name: 'DeviceOem',
  props: {
    name: String,
    devices: Array,
    forceExpanded: {
      type: Boolean,
      default: false
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CollapsibleItem,
    DeviceItem
  }
}
</script>

<style scoped>
.oem {
  user-select: none;
}

.oem .title-container {
  line-height: 16px;

  font-size: 14px;
  font-weight: 500;
}

.oem .title-container {
  height: 48px;
  padding: 16px;
  position: relative;
  display: flex;
  justify-content: space-between;

  transition:
    height 0.25s ease-out,
    padding 0.25s ease-out,
    background 0.25s ease-out;

  cursor: pointer;
}

.oem .title-container.expanded {
  height: 64px;
  padding: 24px 16px;

  @apply bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-5;
}

.oem .title-container .icon {
  font-size: 24px;

  transition:
    top 0.25s ease-out,
    transform 0.125s ease-out;
}

.oem .title-container.expanded .icon {
  transform: rotate(-180deg);
}
</style>
