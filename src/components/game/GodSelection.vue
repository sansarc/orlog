<script setup lang="ts">
import type {IGodFavor} from "../../core/favors/IGodFavor.ts";
import {computed, ref} from "vue";
import {AVAILABLE_GODS} from "../../core/favors/GodsRegistry.ts";
import {audioManager} from "../../core/audio/AudioManager.ts";

const props = defineProps<{
  playerName: string
}>();

const emit = defineEmits<(e: 'confirm', selection: IGodFavor[]) => void>();

const selectedGods = ref<IGodFavor[]>([]);
const hoveredGod = ref<IGodFavor | null>(null);

function toggleGodAt(index: number) {
  const god = selectedGods.value[index];
  if (!god) return;
  toggleGod(god);
}

function getGodTotemFilenameAt(index: number): string {
  const god = selectedGods.value[index];
  if (!god) return '';
  return god.totemImgPath;
}

function toggleGod(god: IGodFavor) {
  const index = selectedGods.value.indexOf(god);

  if (index === -1) {
    if (selectedGods.value.length < 3)
      selectedGods.value.push(god); // select if there's space
  }
  else
    selectedGods.value.splice(index, 1); // deselect
}

function confirmSelection() {
  if (selectedGods.value.length === 3) {
    audioManager.playSFX('button-click');
    emit('confirm', [...selectedGods.value]);
  }
}

const isReady = computed(() => selectedGods.value.length === 3);
</script>

<template>
  <div class="selection-overlay">
    <div class="selection-container">

      <div class="header">
        <h2>{{ props.playerName }}</h2>
        <p>Choose 3 Gods to aid you in battle</p>
      </div>

      <div class="content-grid">

        <div class="pool-section">
          <h3>Pieces</h3>
          <div class="gods-grid">
            <div
                v-for="god in AVAILABLE_GODS"
                :key="god.name"
                class="god-card"
                :class="{
                  'selected': selectedGods.includes(god),
                  'disabled': !selectedGods.includes(god) && selectedGods.length >= 3
                }"
                @click="toggleGod(god)"
                @mouseenter="hoveredGod = god"
            >
              <img :src="god.totemImgPath" class="god-icon" alt="{{ god.name }} totem"/>
              <div class="god-name">{{ god.name }}</div>
            </div>
          </div>
        </div>

        <div class="info-section">

          <div class="slots-row">
            <div v-for="i in 3" :key="i" class="slot">
              <div v-if="selectedGods[i-1]" class="slot-filled"
                   @click="toggleGodAt(i-1)"
              >
                <img v-if="selectedGods[i-1]" :src="getGodTotemFilenameAt(i-1)" alt="{{ selectedGods[i-1].totemImgPath }} totem"/>
              </div>
              <div v-else class="slot-empty">{{ i }}</div>
            </div>
          </div>

          <div class="description-box">
            <template v-if="hoveredGod">
              <h4>{{ hoveredGod.name }}</h4>
              <p class="priority-tag">{{ hoveredGod.priority.replace('_', ' ') }}</p>
              <div class="levels">
                <div class="lvl-row"><span>Lvl 1</span> ({{ hoveredGod.getCost(1) }}<span class="token-icon">⌘</span>)<span class="semi-colon">:</span>{{ hoveredGod.getDescription(1) }}</div>
                <div class="lvl-row"><span>Lvl 1</span> ({{ hoveredGod.getCost(2) }}<span class="token-icon">⌘</span>)<span class="semi-colon">:</span>{{ hoveredGod.getDescription(2) }}</div>
                <div class="lvl-row"><span>Lvl 1</span> ({{ hoveredGod.getCost(3) }}<span class="token-icon">⌘</span>)<span class="semi-colon">:</span>{{ hoveredGod.getDescription(3) }}</div>
              </div>
            </template>
            <div v-else class="placeholder-text">Hover over a god to see their powers.</div>
          </div>

          <button
              class="confirm-btn"
              :disabled="!isReady"
              @click="confirmSelection"
          >CONFIRM</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.selection-overlay {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 200;
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(8px);
}

.selection-container {
  width: 90%; max-width: 900px;
  background: #111;
  border: 1px solid #deb887;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  display: flex; flex-direction: column; gap: 1.5rem
}

.header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 1rem; }
.header h2 { color: #deb887; font-family: 'Cinzel', serif; margin: 0; font-size: 2.5rem; }
.header p { color: #888; margin: 0.5rem 0 0 0; }

.content-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
  min-height: 400px;
}

/* POOL SECTION */
.pool-section h3 { color: #ccc; text-align: center; margin-top: 0; }
.gods-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem; padding: 1rem;
  background: rgba(255,255,255,0.03); border-radius: 8px;
  height: 350px; overflow-y: auto;
}

.god-card {
  background: #222; border: 1px solid #444; border-radius: 6px;
  padding: 0.5rem; cursor: pointer; text-align: center;
  transition: all 0.2s;
}

.god-card:hover { border-color: #deb887; transform: translateY(-2px); }
.god-card.selected { border-color: #ffd700; background: #3d2f20; box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); }
.god-card.disabled { opacity: 0.3; cursor: not-allowed; }

.god-icon { width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px; }
.god-name { font-size: 0.7rem; color: #ccc; }

/* INFO SECTION */
.info-section { display: flex; flex-direction: column; gap: 1.5rem; }

.slots-row { display: flex; justify-content: center; gap: 1rem; }
.slot {
  width: 70px; height: 70px;
  border: 2px dashed #444; border-radius: 8px;
  display: flex; justify-content: center; align-items: center;
}
.slot-filled {
  width: 100%; height: 100%; background: #222; border: 2px solid #deb887;
  border-radius: 8px; cursor: pointer;
  display: flex; justify-content: center; align-items: center;
}
.slot-filled img { width: 50px; height: 50px; object-fit: contain; }
.slot-empty { color: #333; font-size: 1.5rem; font-weight: bold; }

.description-box {
  flex-grow: 1; background: #0b0f13; border: 1px solid #333; padding: 1rem;
  border-radius: 6px; color: #ccc;
}
.placeholder-text { text-align: center; color: #555; padding-top: 2rem; font-style: italic; }

.description-box h4 { color: #deb887; margin: 0 0 0.2rem 0; font-family: 'Cinzel', serif; }
.priority-tag { font-size: 0.7rem; background: #333; display: inline-block; padding: 2px 6px; border-radius: 4px; color: #aaa; margin-bottom: 1rem; }
.lvl-row { font-size: 0.85rem; margin-bottom: 0.5rem; line-height: 1.4; border-bottom: 1px solid #222; padding-bottom: 4px; }
.lvl-row span { color: #ffd700; font-weight: bold; }
.lvl-row .semi-colon { color: white; font-weight: normal; margin-right: 5px; }
.token-icon { color: #ffd700; font-size: 0.85rem; font-weight: bold; }

.confirm-btn {
  padding: 1rem; background: #deb887; color: #000; font-weight: bold; font-family: 'Cinzel', serif;
  border: none; cursor: pointer; font-size: 1.1rem;
}
.confirm-btn:disabled { background: #444; color: #777; cursor: not-allowed; }
</style>