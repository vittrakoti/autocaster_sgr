<template>
  <div class="bg-white shadow rounded-lg p-4 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm font-semibold">シーンコレクション</div>
        <div class="text-xs text-gray-500">
          現在: {{ currentCollection || '—' }}（全 {{ collections.length }}）
        </div>
        <div v-if="lastError" class="text-xs text-red-600 mt-1">{{ lastError }}</div>
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="selected"
          @change="onChange"
          class="border rounded px-2 py-1 text-sm"
          :disabled="connection !== 'connected' || loading || collections.length === 0"
        >
          <option v-for="name in collections" :key="name" :value="name">
            {{ name }}
          </option>
        </select>

        <button
          class="px-2 py-1 rounded text-xs border"
          @click="obs.refreshCollections"
          :disabled="connection !== 'connected' || loading"
          title="Refresh collections from OBS"
        >
          Refresh
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button class="px-3 py-1 rounded text-sm border"
              @click="obs.startStream"
              :disabled="connection !== 'connected' || isStreaming">
        Start Stream
      </button>

      <button class="px-3 py-1 rounded text-sm border"
              @click="obs.stopStream"
              :disabled="connection !== 'connected' || !isStreaming">
        Stop Stream
      </button>

      <button class="px-3 py-1 rounded text-sm border"
              @click="obs.startRecord"
              :disabled="connection !== 'connected' || isRecording">
        Start Record
      </button>

      <button class="px-3 py-1 rounded text-sm border"
              @click="obs.stopRecord"
              :disabled="connection !== 'connected' || !isRecording">
        Stop Record
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import obs from "../obs/obs.controller.js";

// reactive refs from the controller
const connection        = obs.connection;
const collections       = obs.collections;
const currentCollection = obs.currentCollection;
const loading           = obs.loading;
const lastError         = obs.lastError;
const isStreaming       = obs.isStreaming;
const isRecording       = obs.isRecording;

const selected = ref("");

// switch collection when dropdown changes
function onChange() {
  if (selected.value && selected.value !== currentCollection.value) {
    obs.setCollection(selected.value);
  }
}

// keep dropdown selection in sync with OBS current collection
watch(currentCollection, (v) => { selected.value = v || ""; }, { immediate: true });

let off;
onMounted(async () => {
  off = obs.attach();
  await obs.bootstrap();  // if already connected, this fills collections/status
});
onUnmounted(() => off?.());
</script>
