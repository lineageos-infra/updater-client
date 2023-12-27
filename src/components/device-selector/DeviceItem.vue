<template>
  <router-link
      v-bind:to="{
        name: 'device_index',
        params: {
          model,
        },
      }"
  >
    <div
        class="device"
        v-bind:class="{
          'selected': selected,
        }"
        v-show="!hidden"
    >
      <span class="name">
        {{ name }}
      </span>
      <span class="model">
        {{ model }}
      </span>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'DeviceItem',
  props: {
    hidden: Boolean,
    selected: Boolean,
    name: String,
    model: String,
  },
}
</script>

<style scoped>
.device {
  line-height: 16px;

  font-size: 14px;
  font-weight: 500;
}

.device {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 16px;
  padding: 16px 16px 16px 32px;

  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.device .model {
  color: rgba(0, 0, 0, 0.25);
}

#app.dark .device .model {
  color: rgba(255, 255, 255, 0.25);
}

.device.selected {
  background: #167c80;
}

.device.selected .name {
  color: rgba(255, 255, 255, 0.87);
}

.device.selected .model {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
