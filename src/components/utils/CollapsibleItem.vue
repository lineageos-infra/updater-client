<template>
  <div>
    <div>
      <slot
        name="title"
        :isExpanded="isExpanded"
        :toggleManualExpansion="toggleManualExpansion"
      ></slot>
    </div>
    <HeightTransition v-show="isExpanded">
      <slot name="content"></slot>
    </HeightTransition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import HeightTransition from './HeightTransition.vue'

const props = defineProps({
  forceExpanded: {
    type: Boolean,
    default: false
  }
})

const isManuallyExpanded = ref(false)
const isExpanded = ref(false)

const refreshExpansion = () => {
  if (props.forceExpanded) {
    isExpanded.value = true
  } else {
    isExpanded.value = isManuallyExpanded.value
  }
}

const toggleManualExpansion = () => {
  if (props.forceExpanded) {
    return
  }

  isManuallyExpanded.value = !isManuallyExpanded.value
  refreshExpansion()
}

watch(
  () => props.forceExpanded,
  () => {
    refreshExpansion()
  }
)

onMounted(() => {
  refreshExpansion()
})
</script>
