<template>
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
    :style="{
      transition: `height ${this.speed} ${this.timing}`
    }"
  >
    <slot />
  </transition>
</template>

<script>
export default {
  name: 'HeightTransition',
  props: {
    speed: {
      type: String,
      default: '0.25s'
    },
    timing: {
      type: String,
      default: 'ease-out'
    }
  },
  methods: {
    enter(element) {
      element.style.visibility = 'hidden'
      element.style.height = 'auto'

      const height = getComputedStyle(element).height

      element.style.visibility = null
      element.style.height = '0'

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height

      requestAnimationFrame(() => {
        element.style.height = height
      })
    },
    afterEnter(element) {
      element.style.height = 'auto'
    },
    leave(element) {
      element.style.height = getComputedStyle(element).height

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height

      requestAnimationFrame(() => {
        element.style.height = '0'
      })
    }
  }
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
}
</style>
