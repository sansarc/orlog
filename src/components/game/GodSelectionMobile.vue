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
const selectedGodForDetails = ref<IGodFavor | null>(null);

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

  if (index  -1) {
    if (selectedGods.value.length < 3) {
      selectedGods.value.push(god);
      audioManager.playSFX('button-click');
    }
  } else {
    selectedGods.value.splice(index, 1);
    audioManager.playSFX('button-click');
  }
}

function showGodDetails(god: IGodFavor) {
  selectedGodForDetails.value = god;
}

function closeDetails() {
  selectedGodForDetails.value = null;
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
  <div class="mobile-selection-overlay">
    <div class="mobile-selection-container">

      <!-- Header with slots -->
      <div class="mobile-header">
        <h2 class="player-name">{{ props.playerName }}</h2>
        <p class="instruction">Choose 3 Gods</p>

        <div class="slots-bar">
          <div v-for="i in 3" :key="i" class="slot" @click="toggleGodAt(i-1)">
            <div v-if="selectedGods[i-1]" class="slot-filled">
              <img :src="getGodTotemFilenameAt(i-1)" alt="god totem"/>
              <div class="remove-hint">✕</div>
            </div>
            <div v-else class="slot-empty">{{ i }}</div>
          </div>
        </div>
      </div>

      <!-- Scrollable gods grid -->
      <div class="gods-scroll-area">
        <div class="gods-mobile-grid">
          <div
              v-for="god in AVAILABLE_GODS"
              :key="god.name"
              class="god-card-mobile"
              :class="{
                'selected': selectedGods.includes(god),
                'disabled': !selectedGods.includes(god) && selectedGods.length >= 3
              }"
              @click="toggleGod(god)"
          >
            <img :src="god.totemImgPath" class="god-icon-mobile" :alt="god.name + ' totem'"/>
            <div class="god-name-mobile">{{ god.name }}</div>
            <button
                class="info-btn"
                @click.stop="showGodDetails(god)"
                :aria-label="'View ' + god.name + ' details'"
            >
              ℹ️
            </button>
            <div v-if="selectedGods.includes(god)" class="check-mark">✓</div>
          </div>
        </div>
      </div>

      <!-- Confirm button -->
      <div class="mobile-footer">
        <button
            class="mobile-confirm-btn"
            :disabled="!isReady"
            @click="confirmSelection"
        >
          {{ isReady ? 'CONFIRM SELECTION' : `SELECT ${3 - selectedGods.length} MORE` }}
        </button>
      </div>

    </div>

    <!-- Details bottom sheet -->
    <div v-if="selectedGodForDetails" class="details-sheet" @click="closeDetails">
      <div class="sheet-content" @click.stop>
        <div class="sheet-header">
          <h3>{{ selectedGodForDetails.name }}</h3>
          <button class="close-sheet-btn" @click="closeDetails">✕</button>
        </div>

        <div class="sheet-body">
          <div class="god-preview">
            <img :src="selectedGodForDetails.totemImgPath" alt="god totem" class="preview-icon"/>
          </div>

          <div class="priority-badge">
            {{ selectedGodForDetails.priority.replace('_', ' ') }}
          </div>

          <div class="levels-list">
            <div class="level-item">
              <div class="level-header">
                <span class="level-label">Level 1</span>
                <span class="level-cost">{{ selectedGodForDetails.getCost(1) }} <span class="token">⌘</span></span>
              </div>
              <div class="level-desc">{{ selectedGodForDetails.getDescription(1) }}</div>
            </div>

            <div class="level-item">
              <div class="level-header">
                <span class="level-label">Level 2</span>
                <span class="level-cost">{{ selectedGodForDetails.getCost(2) }} <span class="token">⌘</span></span>
              </div>
              <div class="level-desc">{{ selectedGodForDetails.getDescription(2) }}</div>
            </div>

            <div class="level-item">
              <div class="level-header">
                <span class="level-label">Level 3</span>
                <span class="level-cost">{{ selectedGodForDetails.getCost(3) }} <span class="token">⌘</span></span>
              </div>
              <div class="level-desc">{{ selectedGodForDetails.getDescription(3) }}</div>
            </div>
          </div>

          <button
              class="sheet-select-btn"
              :class="{ 'selected': selectedGods.includes(selectedGodForDetails) }"
              @click="toggleGod(selectedGodForDetails); closeDetails()"
              :disabled="!selectedGods.includes(selectedGodForDetails) && selectedGods.length >= 3"
          >
            {{ selectedGods.includes(selectedGodForDetails) ? '✓ SELECTED' : 'SELECT THIS GOD' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.mobile-selection-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.mobile-selection-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/*  HEADER  */
.mobile-header {
  flex-shrink: 0;
  background: linear-gradient(to bottom, #0b1016, #111);
  border-bottom: 2px solid #deb887;
  padding: 1.25rem 1rem 1rem;
  text-align: center;
}

.player-name {
  color: #deb887;
  font-family: 'Cinzel', serif;
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 0 15px rgba(222, 184, 135, 0.5);
}

.instruction {
  color: #888;
  margin: 0.5rem 0 1rem;
  font-size: 0.9rem;
}

.slots-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.slot {
  width: 70px;
  height: 70px;
  border: 2px dashed #444;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
}

.slot-filled {
  width: 100%;
  height: 100%;
  background: #222;
  border: 2px solid #deb887;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 0 15px rgba(222, 184, 135, 0.3);
}

.slot-filled img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.remove-hint {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #d32f2f;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.slot-empty {
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

/*  GODS GRID  */
.gods-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  padding-bottom: 0;
  background: #0b1016;
  position: relative;
  z-index: 1;
}

.gods-mobile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding-bottom: 2rem;
}

.god-card-mobile {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
  min-height: 160px;
}

.god-card-mobile:active {
  transform: scale(0.97);
}

.god-card-mobile.selected {
  border-color: #ffd700;
  background: linear-gradient(135deg, #2a2010 0%, #1a1a1a 100%);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.god-card-mobile.disabled {
  opacity: 0.4;
  filter: grayscale(1);
  cursor: not-allowed;
}

.god-icon-mobile {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
}

.god-name-mobile {
  font-size: 0.9rem;
  color: #eee;
  font-weight: bold;
  font-family: 'Cinzel', serif;
  text-align: center;
}

.info-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  z-index: 10;
}

.info-btn:active {
  background: #deb887;
  transform: scale(0.95);
}

.check-mark {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #4caf50;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.5);
}

/*  FOOTER  */
.mobile-footer {
  flex-shrink: 0;
  padding: 1rem;
  background: linear-gradient(to top, #0b1016, #111);
  border-top: 2px solid #deb887;
  position: relative;
  z-index: 50;
}

.mobile-confirm-btn {
  width: 100%;
  padding: 1.2rem;
  background: #deb887;
  color: #0b1016;
  font-weight: bold;
  font-family: 'Cinzel', serif;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  letter-spacing: 1px;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(222, 184, 135, 0.3);
  position: relative;
  z-index: 51;
  pointer-events: auto;
}

.mobile-confirm-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
  box-shadow: none;
  pointer-events: none;
}

.mobile-confirm-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(222, 184, 135, 0.3);
}

/*  DETAILS BOTTOM SHEET  */
.details-sheet {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sheet-content {
  width: 100%;
  max-height: 75vh;
  background: #111;
  border-radius: 20px 20px 0 0;
  border-top: 2px solid #deb887;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.sheet-header h3 {
  color: #deb887;
  font-family: 'Cinzel', serif;
  margin: 0;
  font-size: 1.5rem;
}

.close-sheet-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #555;
  color: #ccc;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-sheet-btn:active {
  background: #deb887;
  color: #0b1016;
}

.sheet-body {
  overflow-y: auto;
  padding: 1.25rem;
  flex: 1;
}

.god-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.preview-icon {
  width: 100px;
  height: 100px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));
}

.priority-badge {
  display: inline-block;
  background: #333;
  color: #aaa;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.level-item {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-label {
  color: #ffd700;
  font-weight: bold;
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
}

.level-cost {
  color: #deb887;
  font-weight: bold;
}

.token {
  color: #ffd700;
  font-size: 0.9rem;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.level-desc {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
}

.sheet-select-btn {
  width: 100%;
  padding: 1.2rem;
  background: #deb887;
  color: #0b1016;
  font-weight: bold;
  font-family: 'Cinzel', serif;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.sheet-select-btn.selected {
  background: #4caf50;
  color: white;
}

.sheet-select-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.sheet-select-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/*  SCROLLBAR  */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0b1016;
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #deb887;
}

@media (min-width: 400px) {
  .gods-mobile-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-height: 700px) {
  .mobile-header {
    padding: 1rem 1rem 0.75rem;
  }

  .player-name {
    font-size: 1.5rem;
  }

  .slot {
    width: 60px;
    height: 60px;
  }
}
</style>