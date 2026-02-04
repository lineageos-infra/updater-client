<template>
  <transition
    name="expand"
    :style="{
      transition: `height ${speed} ${timing}`
    }"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot />
  </transition>
</template>

<script setup>
defineProps({
  speed: {
    type: String,
    default: '0.25s'
  },
  timing: {
    type: String,
    default: 'ease-out'
  }
})

const enter = (element) => {
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
}

const afterEnter = (element) => {
  element.style.height = 'auto'
}

const leave = (element) => {
  element.style.height = getComputedStyle(element).height

  // Force repaint to make sure the
  // animation is triggered correctly.
  getComputedStyle(element).height

  requestAnimationFrame(() => {
    element.style.height = '0'
  })
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
}
</style>
