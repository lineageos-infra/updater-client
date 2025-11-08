<template>
  <div class="device-selector">
    <div
      class="search-container focus:border-brand-primary border-b border-solid border-black/15 text-sm focus:border-b-2 dark:border-white/15"
    >
      <input type="text" placeholder="Search..." v-model="filterText" />
      <i class="mdi mdi-close clear opacity-35" v-if="filterText" v-on:click="clearFilterText"></i>
    </div>
    <div class="oems">
      <device-oem v-for="oem in oems" v-bind="oem" :key="oem.name"></device-oem>
    </div>
  </div>
</template>

<script>
import ApiService from '../../js/ApiService'
import DeviceOem from './DeviceOem.vue'

export default {
  name: 'DeviceSelector',
  components: {
    DeviceOem
  },
  props: {
    activeModel: String
  },
  data() {
    return {
      filterText: ''
    }
  },
  computed: {
    oems() {
      return this.$store.getters.oems
    }
  },
  watch: {
    activeModel() {
      const cleared = this.clearFilterText()
      if (!cleared) {
        this.refreshDevices()
      }
    },
    filterText() {
      this.onFilterChange()
    },
    oems() {
      this.refreshDevices()
    }
  },
  async beforeMount() {
    try {
      await ApiService.loadOems()
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    clearFilterText() {
      if (this.filterText === '') {
        return false
      }

      this.filterText = ''
      return true
    },
    resetFilterDevices() {
      for (const oem of this.oems) {
        oem.forceExpanded = false
        oem.hidden = false
        for (const device of oem.devices) {
          device.hidden = false
          device.selected = false
        }
      }
    },
    selectActiveDevice() {
      for (const oem of this.oems) {
        for (const device of oem.devices) {
          if (device.model === this.activeModel) {
            oem.forceExpanded = true
            oem.hidden = false
            device.hidden = false
            device.selected = true
            return
          }
        }
      }
    },
    refreshDevices() {
      this.resetFilterDevices()
      this.selectActiveDevice()
    },
    filterDevices(filterText) {
      if (!filterText) {
        this.refreshDevices()
        return
      }

      this.resetFilterDevices()

      for (const oem of this.oems) {
        if (oem.name.toLowerCase().includes(filterText)) {
          oem.forceExpanded = true
          continue
        }

        oem.hidden = true
        for (const device of oem.devices) {
          device.hidden = true

          if (`${oem.name} ${device.name} ${device.model}`.toLowerCase().includes(filterText)) {
            oem.forceExpanded = true
            oem.hidden = false
            device.hidden = false
          }
        }
      }

      this.selectActiveDevice()
    },
    onFilterChange() {
      this.filterDevices(this.filterText.toLowerCase())
    }
  }
}
</script>

<style scoped>
.device-selector {
  display: flex;
  flex-direction: column;

  overflow: auto;
}

.device-selector .search-container {
  width: 100%;
  height: 64px;

  display: flex;

  position: relative;

  flex-shrink: 0;
}

.device-selector .search-container input {
  width: 100%;
  height: 100%;
  padding: 16px;

  outline: 0;
  border: 0;
  background: transparent;

  transition: border 0.125s ease-out;
}

.device-selector .search-container .clear {
  display: block;
  position: absolute;
  right: 16px;
  top: 16px;

  height: 32px;
  width: 32px;
  line-height: 32px;

  font-size: 24px;

  cursor: pointer;
}

.device-selector .oems {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
}
</style>
