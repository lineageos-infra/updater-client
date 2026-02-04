<template>
  <RouterLink
    :to="{
      name: 'device_index',
      params: {
        model: props.model
      }
    }"
  >
    <div
      v-show="!props.hidden"
      class="flex items-center justify-between gap-4 border-t border-black/12 p-4 pl-8 text-sm leading-4 font-medium"
      :class="props.selected ? 'bg-brand-primary' : ''"
    >
      <span :class="props.selected ? 'text-white/87' : ''">
        {{ props.name }}
      </span>
      <span :class="props.selected ? 'text-white/50' : ''">
        {{ props.model }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup>
const props = defineProps({
  hidden: Boolean,
  selected: Boolean,
  name: String,
  model: String
})
</script>
