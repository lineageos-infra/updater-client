<template>
  <svg :width="sizeValue" :height="sizeValue" :viewBox="viewboxValue" :style="styles">
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type FlipType = 'horizontal' | 'vertical' | 'both' | 'none'

interface Props {
  path: string
  size?: string | number
  viewbox?: string
  flip?: FlipType
  rotate?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'mdi',
  size: 24,
  flip: 'none',
  rotate: 0
})

const defaults = {
  size: 24,
  viewbox: '0 0 24 24'
}

const styles = computed(() => ({
  '--sx': ['both', 'horizontal'].includes(props.flip) ? '-1' : '1',
  '--sy': ['both', 'vertical'].includes(props.flip) ? '-1' : '1',
  '--r': `${props.rotate}deg`,
  'min-width': `${props.size}px`
}))

const sizeValue = computed(() => props.size || defaults.size)
const viewboxValue = computed(() => props.viewbox || defaults.viewbox)
</script>

<style scoped>
svg {
  transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
}

path {
  fill: currentColor;
}
</style>
