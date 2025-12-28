<script setup lang="ts">
import { ref } from 'vue';
import type { IDie, IPlayer } from '../../core/interfaces';

const props = defineProps<{
  player: IPlayer;
  opponent: IPlayer;
  favorName: string;
  targetType: 'OPPONENT_DICE' | 'OWN_DICE' | 'ANY_DICE' | 'SELF_HEALTH';
  selectionLimit: number;
}>();

const emit = defineEmits<{
  (e: 'confirm', selection: IDie[]): void;
  (e: 'cancel'): void;
}>();

const selectedDice = ref<IDie[]>([]);

function toggleDie(die: IDie) {
  if (die.isResolved) return;

  const index = selectedDice.value.indexOf(die);
  if (index > -1)
    // Deselect
    selectedDice.value.splice(index, 1);
  else if (selectedDice.value.length < props.selectionLimit)
    // Select (if limit not reached)
    selectedDice.value.push(die);
}

function confirm() {
  emit('confirm', [...selectedDice.value]);
}
</script>

<template>
  <div class="modal-overlay">
    <div class="selector-modal">

      <div class="modal-header">
        <h3>Select Targets</h3>
        <p>Pick <span class="highlight">{{ selectedDice.length }} / {{ selectionLimit }}</span> dice for .</p>
      </div>

      <div class="pools-container">

        <div v-if="targetType !== 'OPPONENT_DICE'" class="pool-section">
          <h4>Your Dice</h4>
          <div class="dice-grid">
            <div
                v-for="(die, index) in player.dice"
                :key="'p1-'+index"
                class="die-card"
                :class="{ 'selected': selectedDice.includes(die), 'disabled': die.isResolved }"
                @click="toggleDie(die)"
            >
              <div class="die-face-text">{{ die.face }}</div>
              <div v-if="selectedDice.includes(die)" class="check-mark">✔</div>
            </div>
          </div>
        </div>

        <div v-if="targetType === 'ANY_DICE'" class="pool-divider"></div>

        <div v-if="targetType !== 'OWN_DICE'" class="pool-section">
          <h4>Opponent Dice</h4>
          <div class="dice-grid opponent-grid">
            <div
                v-for="(die, index) in opponent.dice"
                :key="'p2-'+index"
                class="die-card"
                :class="{ 'selected': selectedDice.includes(die), 'disabled': die.isResolved }"
                @click="toggleDie(die)"
            >
              <div class="die-face-text">{{ die.face }}</div>
              <div v-if="selectedDice.includes(die)" class="check-mark">✔</div>
            </div>
          </div>
        </div>

      </div>

      <div class="actions">
        <button class="btn cancel" @click="$emit('cancel')">Cancel</button>
        <button class="btn confirm" :disabled="selectedDice.length === 0" @click="confirm">
          Reroll
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.selector-modal { background: #151a21; border: 1px solid #deb887; padding: 1.5rem; border-radius: 12px; width: 600px; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 0 20px black; }
.modal-header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
.modal-header h3 { margin: 0; color: #deb887; font-family: 'Cinzel', serif; }
.highlight { color: #ffd700; font-weight: bold; }

.pools-container { display: flex; gap: 1rem; min-height: 150px; }
.pool-section { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.pool-section h4 { text-align: center; margin: 0; color: #888; font-size: 0.9rem; }
.pool-divider { width: 1px; background: #333; }

.dice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 8px; }
.opponent-grid .die-card { border-color: #664444; }

.die-card { aspect-ratio: 1; border: 2px solid #444; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; background: #222; font-size: 0.6rem; color: #ccc; transition: all 0.2s; }
.die-card:hover { border-color: #777; }
.die-card.selected { border-color: #ffd700; background: #3d2f20; transform: scale(1.05); }
.die-card.disabled { opacity: 0.3; pointer-events: none; }

.check-mark { position: absolute; top: -5px; right: -5px; background: #ffd700; color: black; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; display: flex; align-items: center; justify-content: center; }

.actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; }
.btn { padding: 0.8rem 1.5rem; border: none; cursor: pointer; font-weight: bold; border-radius: 4px; }
.confirm { background: #deb887; color: black; }
.cancel { background: transparent; color: #888; border: 1px solid #555; }
</style>