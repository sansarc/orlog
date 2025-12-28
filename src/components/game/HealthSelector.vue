<script setup lang="ts">
import type {IPlayer} from "../../core/interfaces.ts";
import {computed, ref} from "vue";

const props = defineProps<{
  player: IPlayer;
}>();

const emit = defineEmits<{
  (e: 'confirm', amount: number): void;
  (e: 'cancel'): void;
}>();

const maxSacrifice = computed(() => Math.max(0, props.player.health - 1));
const sacrifice = ref(0);

function confirm() {
  emit('confirm', sacrifice.value);
}
</script>

<template>
  <div class="modal-overlay">
    <div class="selector-modal">

      <div class="header">
        <h3>Sacrifice Health</h3>
        <p>Current Health: <span class="hp">{{ player.health }}</span></p>
      </div>

      <div class="controls">
        <div class="value-display">-{{ sacrifice }} HP</div>

        <input
            type="range"
            min="0"
            :max="maxSacrifice"
            v-model.number="sacrifice"
            class="slider"
        />

        <div class="range-labels">
          <span>0</span>
          <span>{{ maxSacrifice }}</span>
        </div>
      </div>

      <div class="warning" v-if="sacrifice === 0">
        Select an amount to sacrifice.
      </div>

      <div class="actions">
        <button class="btn cancel" @click="$emit('cancel')">Cancel</button>
        <button class="btn confirm" :disabled="sacrifice === 0" @click="confirm">
          Confirm
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.selector-modal { background: #151a21; border: 1px solid #c0392b; padding: 2rem; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 0 30px rgba(192, 57, 43, 0.3); }

.header h3 { margin: 0; color: #c0392b; font-family: 'Cinzel', serif; font-size: 1.8rem; }
.hp { color: #2ecc71; font-weight: bold; }

.controls { margin: 2rem 0; display: flex; flex-direction: column; gap: 1rem; align-items: center; }
.value-display { font-size: 2.5rem; font-weight: bold; color: #c0392b; }

.slider { width: 100%; cursor: pointer; accent-color: #c0392b; }
.range-labels { width: 100%; display: flex; justify-content: space-between; color: #666; font-size: 0.8rem; }

.actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
.btn { padding: 0.8rem 2rem; border: none; cursor: pointer; font-weight: bold; border-radius: 4px; font-size: 1rem; }
.confirm { background: #c0392b; color: white; }
.cancel { background: transparent; color: #888; border: 1px solid #555; }
.warning { color: #888; font-style: italic; margin-bottom: 1rem; font-size: 0.9rem; }
</style>