<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '../../composables/useGame';
import type {IGodFavor} from "../../core/favors/IGodFavor.ts";

const { game, currentPlayer } = useGame();
const budget = computed(() => game.phase.currentBudget || 0);

function selectFavor(favor: IGodFavor, level: 1 | 2 | 3) {
  game.onFavorClicked(favor, level);
}
function skipFavor() {
  game.onFavorClicked(null);
}
</script>

<template>
  <div class="favor-menu-container">
    <div class="menu-header">
      <div class="budget">
        Power: <span class="gold">{{ budget }} ⌘</span>
      </div>
    </div>

    <div class="scroll-area">
      <div class="favor-list">
        <div v-for="favor in currentPlayer.favors" :key="favor.name" class="favor-row">

          <div class="favor-info">{{ favor.name }}</div>

          <div class="level-group">
            <div v-for="level in [1, 2, 3]" :key="level" class="level-wrapper">
              <button
                  class="lvl-btn"
                  :class="{ 'affordable': favor.getCost(level) <= budget }"
                  :disabled="favor.getCost(level) > budget"
                  @click="selectFavor(favor, level as 1|2|3)"
              >
                <span class="roman">{{ 'I'.repeat(level) }}</span>
                <span class="cost">{{ favor.getCost(level) }}</span>
              </button>
              <div class="tooltip">{{ favor.getDescription(level) }}</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <button class="skip-btn" @click="skipFavor">Skip</button>
  </div>
</template>

<style scoped>
.favor-menu-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-header {
  text-align: center;
  color: #ccc;
  margin-top: -25px;
}

.gold { color: #ffd700; font-weight: bold; }

.scroll-area {
  max-height: 400px; /* Fits sidebar nicely */
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scroll-area::-webkit-scrollbar {
  display: none;
}

.favor-list { display: flex; flex-direction: column; gap: 1rem; }

.favor-row {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.05);
}

.favor-info {
  font-weight: bold;
  color: #deb887;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.level-group { display: flex; gap: 0.5rem; justify-content: space-between; }
.level-wrapper { position: relative; flex: 1; }

.lvl-btn {
  background: #222; border: 1px solid #444; color: #666;
  width: 100%; padding: 6px 0;
  display: flex; flex-direction: column; align-items: center;
  cursor: not-allowed; border-radius: 4px;
}

.lvl-btn.affordable {
  background: #2f3d2f; border-color: #4caf50; color: #fff; cursor: pointer;
}
.lvl-btn.affordable:hover { background: #3d553d; }

.roman { font-size: 0.65rem; opacity: 0.8; }
.cost { font-weight: bold; font-size: 0.85rem; color: #ffd700; }

.skip-btn {
  width: 100%; padding: 0.8rem;
  background: transparent; border: 1px solid #666; color: #aaa;
  cursor: pointer; margin-top: 1rem;
}
.skip-btn:hover { border-color: #fff; color: #fff; }

/* Tooltip (Top direction for Sidebar items) */
.tooltip {
  position: absolute; bottom: 100%; left: 50%;
  transform: translateX(-50%) translateY(-5px);
  background: #111; border: 1px solid #deb887; color: #deb887;
  padding: 0.5rem; font-size: 0.75rem; white-space: nowrap;
  border-radius: 4px; opacity: 0; visibility: hidden; pointer-events: none; z-index: 100;
}
.level-wrapper:hover .tooltip { opacity: 1; visibility: visible; }
</style>