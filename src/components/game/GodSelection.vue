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
  width: 90vw;
  height: 85vh;
  max-width: 1600px;
  max-height: 1000px;

  background: #111;
  border: 1px solid #deb887;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.9);

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow: hidden;
}

/* HEADER: Don't let it shrink */
.header {
  text-align: center;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
  flex-shrink: 0;
}
.header h2 { color: #deb887; font-family: 'Cinzel', serif; margin: 0; font-size: 2.5rem; }
.header p { color: #888; margin: 0.5rem 0 0 0; }

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;

  flex: 1;        /* Take up all remaining vertical space */
  min-height: 0;
}

/* --- LEFT: POOL SECTION --- */
.pool-section {
  display: flex;
  flex-direction: column;
  height: 100%;    /* Fill the grid cell */
  min-height: 0;
}

.pool-section h3 {
  color: #ccc;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.gods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* Increased from 160px */
  grid-auto-rows: max-content;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 1rem;
}

.god-card {
  background: #222;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.god-icon {
  width: 110px;
  height: 110px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
}
.god-card:hover { border-color: #deb887; transform: translateY(-3px); background: #2a2a2a; }
.god-card.selected { border-color: #ffd700; background: #3d2f20; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
.god-card.disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }

.god-name { font-size: 0.9rem; color: #eee; font-weight: bold; font-family: 'Cinzel', serif; }


/* --- RIGHT: INFO SECTION --- */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}

.levels { display: flex; flex-direction: column; gap: 0.5rem; }
.lvl-row { font-size: 0.9rem; line-height: 1.4; border-bottom: 1px solid #222; padding-bottom: 6px; }

.lvl-row span {
  color: #ffd700;
  font-weight: bold;
}

.lvl-row .semi-colon {
  color: #ccc;
  font-weight: normal;
  margin-right: 5px;
}

.token-icon {
  color: #ffd700;
  font-size: 0.85rem;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); /* <--- The Glow Effect */
}

.slots-row { display: flex; justify-content: center; gap: 1rem; flex-shrink: 0; }
.slot {
  width: 80px; height: 80px;
  border: 2px dashed #444; border-radius: 8px;
  display: flex; justify-content: center; align-items: center;
}
.slot-filled {
  width: 100%; height: 100%; background: #222; border: 2px solid #deb887;
  border-radius: 8px; cursor: pointer;
  display: flex; justify-content: center; align-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
.slot-filled img { width: 55px; height: 55px; object-fit: contain; }
.slot-empty { color: #333; font-size: 1.5rem; font-weight: bold; }

.description-box {
  background: #0b0f13;
  border: 1px solid #333;
  padding: 1.5rem;
  border-radius: 6px;
  color: #ccc;

  /* SCROLLING BEHAVIOR */
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.description-box h4 { color: #deb887; margin: 0 0 0.5rem 0; font-family: 'Cinzel', serif; font-size: 1.3rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
.priority-tag { font-size: 0.75rem; background: #333; display: inline-block; padding: 3px 6px; border-radius: 4px; color: #aaa; margin-bottom: 1rem; text-transform: uppercase; }

.confirm-btn {
  padding: 1rem;
  background: #deb887; color: #000; font-weight: bold; font-family: 'Cinzel', serif;
  border: none; cursor: pointer; font-size: 1.2rem; letter-spacing: 2px;
  flex-shrink: 0; /* Don't let it vanish */
}
.confirm-btn:hover:not(:disabled) { background: #fff; box-shadow: 0 0 20px rgba(222, 184, 135, 0.4); }
.confirm-btn:disabled { background: #333; color: #555; cursor: not-allowed; border: 1px solid #444; }

/* SCROLLBAR STYLING (Viking Theme) */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #1a1a1a; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #deb887; }
</style>