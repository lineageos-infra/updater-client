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

<script setup lang="ts">
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

const enter = (element: Element) => {
  const el = element as HTMLElement
  el.style.visibility = 'hidden'
  el.style.height = 'auto'

  const height = getComputedStyle(el).height

  el.style.visibility = 'visible'
  el.style.height = '0'

  // Force repaint to make sure the
  // animation is triggered correctly.
  void getComputedStyle(el).height

  requestAnimationFrame(() => {
    el.style.height = height
  })
}

const afterEnter = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = 'auto'
}

const leave = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = getComputedStyle(el).height

  // Force repaint to make sure the
  // animation is triggered correctly.
  void getComputedStyle(el).height

  requestAnimationFrame(() => {
    el.style.height = '0'
  })
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
}
</style>
