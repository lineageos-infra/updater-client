<template>
  <div class="flex h-full w-full flex-col">
    <div
      ref="scrollable"
      class="h-full w-full grow overflow-y-auto"
      @scroll="checkScrolledToBottom"
    >
      <div class="mx-auto max-w-189 min-w-0 px-8">
        <template v-if="model">
          <template v-for="change in buildChanges" :key="change.id">
            <ChangesGroup v-bind="change" />
          </template>
        </template>
        <template v-else>
          <ChangesGroup
            v-bind="{
              items: changes
            }"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChangesGroup from './ChangesGroup.vue'
import ApiService from '@/services/ApiService'
import { loadDeviceBuildsBeforeHook } from '@/hooks/loadBeforeHooks'
import { ref, computed, onMounted, onUnmounted, watch, useTemplateRef } from 'vue'
import { useChangeStore } from '@/stores/change'

const props = defineProps({
  model: String
})
const store = useChangeStore()
const scrollable = useTemplateRef('scrollable')
const buildChanges = ref([])
const stopLoading = ref(false)

const changes = computed(() => store.items)

function reloadDeviceChanges() {
  if (props.model) {
    buildChanges.value = ApiService.getDeviceChanges(props.model)
  }
}

async function loadMoreChanges() {
  try {
    await ApiService.loadMoreChanges()
  } catch (err) {
    console.error(err)
  }
}

function isScrolledToBottom(el) {
  if (!el) {
    return false
  }

  return el.scrollHeight - el.scrollTop - el.clientHeight < 1
}

function checkScrolledToBottom() {
  if (!isScrolledToBottom(scrollable.value)) {
    return
  }

  if (stopLoading.value) {
    return
  }

  loadMoreChanges()
}

onMounted(() => {
  stopLoading.value = false
  checkScrolledToBottom()
})

onUnmounted(() => {
  stopLoading.value = true
})

watch(() => props.model, reloadDeviceChanges, { immediate: true })
watch(
  changes,
  () => {
    reloadDeviceChanges()
    checkScrolledToBottom()
  },
  { immediate: true }
)

defineOptions({
  beforeRouteEnter: loadDeviceBuildsBeforeHook,
  beforeRouteUpdate: loadDeviceBuildsBeforeHook
})
</script>
