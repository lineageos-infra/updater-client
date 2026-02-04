<template>
  <CollapsibleItem
    v-show="!hidden"
    class="oem border-b border-solid border-black/15 dark:border-white/15"
    :forceExpanded="forceExpanded"
  >
    <template v-slot:title="{ isExpanded, toggleManualExpansion }">
      <div
        class="title-container"
        :class="{
          expanded: isExpanded
        }"
        @click="toggleManualExpansion"
      >
        <span class="title">
          {{ name }}
        </span>
        <i v-if="!forceExpanded" class="mdi mdi-chevron-down icon opacity-35"> </i>
      </div>
    </template>
    <template v-slot:content>
      <div class="devices-container">
        <div class="devices">
          <template v-for="device in devices" :key="device.model">
            <DeviceItem v-bind="device"></DeviceItem>
          </template>
        </div>
      </div>
    </template>
  </CollapsibleItem>
</template>

<script setup>
import CollapsibleItem from '../utils/CollapsibleItem.vue'
import DeviceItem from './DeviceItem.vue'

defineProps({
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
})
</script>

<style scoped>
@reference 'tailwindcss';

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

  @apply bg-black/10 dark:bg-white/5;
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
