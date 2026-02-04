<template>
  <div>
    <div>
      <slot
        name="title"
        :isExpanded="isExpanded"
        :toggleManualExpansion="toggleManualExpansion"
      ></slot>
    </div>
    <height-transition v-show="isExpanded">
      <slot name="content"></slot>
    </height-transition>
  </div>
</template>

<script>
import HeightTransition from './HeightTransition.vue'

export default {
  name: 'CollapsibleItem',
  components: {
    HeightTransition
  },
  props: {
    forceExpanded: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    forceExpanded() {
      this.refreshExpansion()
    }
  },
  data() {
    return {
      isManuallyExpanded: false,
      isExpanded: false
    }
  },
  mounted() {
    this.refreshExpansion()
  },
  methods: {
    refreshExpansion() {
      if (this.forceExpanded) {
        this.isExpanded = true
      } else {
        this.isExpanded = this.isManuallyExpanded
      }
    },
    toggleManualExpansion() {
      if (this.forceExpanded) {
        return
      }

      this.isManuallyExpanded = !this.isManuallyExpanded
      this.refreshExpansion()
    }
  }
}
</script>
