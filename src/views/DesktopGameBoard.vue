<script setup lang="ts">
import type {useGameController} from "../composables/useGameController.ts";
import DiceSelector from "../components/game/DiceSelector.vue";
import HealthSelector from "../components/game/HealthSelector.vue";
import CoinToss from "../components/game/CoinToss.vue";
import GodSelection from "../components/game/GodSelection.vue";
import GameOver from "../components/game/GameOver.vue";
import PlayerMat from "../components/game/PlayerMat.vue";
import GodTotems from "../components/game/GodTotems.vue";
import DiceTray from "../components/game/DiceTray.vue";
import FavorMenu from "../components/game/FavorMenu.vue";
import GameRules from "../components/game/GameRules.vue";
import type {FavorTargetType} from "../core/favors/IGodFavor.ts";

const props = defineProps<{
  controller: ReturnType<typeof useGameController>
}>();

const {
  game,
  player1,
  player2,
  currentPlayer,
  isP1Turn,
  isP2Turn,
  phaseName,
  setupStage,
  winnerName,
  hasGameStarted,
  isOverlayActive,
  isFavorPhase,
  isRolling,
  hideP1Kept,
  hideP2Kept,
  activeSelectorCaster,
  activeSelectorFavor,
  showDiceSelector,
  showHealthSelector,
  startGame,
  handleGodConfirmation,
  handleRestart,
  handleRollClick,
  confirmTurn,
  onSelectorConfirm,
  onSelectorCancel,
  onHealthConfirm,
  onHealthCancel,
  p1NameInput,
  p2NameInput,
  toggleMute,
  isMuted,
  volumeLevel,
  onVolumeChange,
  isRollPhase,
  canRoll,
  p1TrayRef, p2TrayRef,
  p1MatRef, p2MatRef,
  p1TotemsRef, p2TotemsRef,
  coinRef,
  showRules
} = props.controller;


</script>

<template>
  <div class="view-container">

    <GameRules v-if="showRules" @close="showRules = false" />

    <button class="help-fab" @click="showRules = true" title="Game Rules">
      ?
    </button>

    <div class="audio-controls">
      <button class="mute-btn" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
        <span v-if="!isMuted">🔊</span>
        <span v-else>🔇</span>
      </button>

      <input class="vol-slider"
             type="range" min="0" max="100"
             v-model="volumeLevel" @input="onVolumeChange"
      />
    </div>

    <DiceSelector
        v-if="showDiceSelector && activeSelectorFavor && activeSelectorCaster"
        :player="activeSelectorCaster"
        :opponent="game.getOtherPlayer(activeSelectorCaster)"
        :favor-name="activeSelectorFavor.name"
        :target-type="activeSelectorFavor.targetType as FavorTargetType"
        :selection-limit="activeSelectorFavor.getSelectionLimit?.(activeSelectorCaster.selectedFavor.level) as number"
        @confirm="onSelectorConfirm"
        @cancel="onSelectorCancel"
    />

    <HealthSelector
        v-if="showHealthSelector && activeSelectorCaster"
        :player="activeSelectorCaster"
        @confirm="onHealthConfirm"
        @cancel="onHealthCancel"
    />

    <div class="background-layer">
      <div class="blur">
        <div class="blob"></div>
      </div>
      <span class="aur aur_1"></span>
      <span class="aur aur_2"></span>
    </div>

    <div class="overlay-layer" v-if="setupStage === 'COIN'">
      <CoinToss
          ref="coinRef"
          :player1-name="player1.name"
          :player2-name="player2.name"
      />
    </div>

    <div class="overlay-layer" v-if="setupStage === 'P1_SELECT'">
      <GodSelection
          :player-name="player1.name"
          @confirm="handleGodConfirmation"
      />
    </div>

    <div class="overlay-layer" v-if="setupStage === 'P2_SELECT'">
      <GodSelection
          :player-name="player2.name"
          @confirm="handleGodConfirmation"
      />
    </div>

    <div class="overlay-layer" v-if="setupStage === 'GAME_OVER'">
      <GameOver :winner-name="winnerName" @restart="handleRestart"/>
    </div>

    <div class="game-layout" :class="{ 'layout-blurred': isOverlayActive || setupStage === 'GAME_OVER' }">

      <div class="battlefield" :class="{ 'blurred': setupStage === 'SETUP' }">

        <div class="player-zone opponent" :class="{ 'inactive-state': hasGameStarted && !isP2Turn }">
          <PlayerMat ref="p2MatRef" :player="player2" :is-active="hasGameStarted && isP2Turn" />
          <div class="zone-row">
            <GodTotems ref="p2TotemsRef" :player="player2" />
            <DiceTray
                ref="p2TrayRef"
                :player="player2"
                :interactive="hasGameStarted && isP2Turn"
                :hide-kept-visuals="hideP2Kept"
            />
          </div>
        </div>

        <div class="battle-divider"></div>

        <div class="player-zone player" :class="{ 'inactive-state': hasGameStarted && !isP1Turn }">
          <div class="zone-row">
            <GodTotems ref="p1TotemsRef" :player="player1" />
            <DiceTray
                ref="p1TrayRef"
                :player="player1"
                :interactive="hasGameStarted && isP1Turn"
                :hide-kept-visuals="hideP1Kept"
            />
          </div>
          <PlayerMat ref="p1MatRef" :player="player1" :is-active="hasGameStarted && isP1Turn" />
        </div>
      </div>

      <div class="sidebar">

        <div class="phase-header">
          <h3 class="phase-text">
            {{ setupStage === 'SETUP' ? 'SETUP' : (hasGameStarted ? phaseName + ' PHASE' : 'PREPARING...') }}
          </h3>

          <div v-if="hasGameStarted" class="turn-indicator">
            Current Turn: <span class="turn-name">{{ currentPlayer.name }}</span>
          </div>
        </div>

        <div class="control-panel">

          <div v-if="setupStage === 'SETUP'" class="setup-menu">
            <div class="input-group">
              <label>Player 1 Name</label>
              <input v-model="p1NameInput" placeholder="Player 1" maxlength="12" />
            </div>

            <div class="input-group">
              <label>Player 2 Name</label>
              <input v-model="p2NameInput" placeholder="Player 2" maxlength="12" />
            </div>

            <button class="action-btn start-btn" @click="startGame">
              NEXT: CHOOSE GODS
            </button>
          </div>

          <div v-else-if="setupStage === 'PLAYING'" class="game-controls-wrapper">
            <FavorMenu v-if="isFavorPhase" />

            <div v-else class="action-buttons">
              <button
                  v-if="isRollPhase"
                  class="action-btn"
                  :class="{ 'blocked': !canRoll || isRolling }"
                  :disabled="!canRoll || isRolling"
                  @click.stop="handleRollClick">
                {{ isRolling ? 'ROLLING...' : 'ROLL' }}
              </button>

              <button class="confirm-btn" @click="confirmTurn">
                {{ isRollPhase ? 'END TURN' : 'CONFIRM' }}
              </button>
            </div>
          </div>

          <div v-else class="placeholder-msg">
            Fate is being decided...
          </div>

        </div>
      </div>

    </div>



  </div>
</template>

<style scoped>
.view-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0b1016;
  color: white;
}

/* --- AUDIO CONTROLS AND HELP SECTION --- */
.help-fab {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 9999;

  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(11, 16, 22, 0.9);
  border: 2px solid #deb887;
  color: #deb887;
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: auto;
}

.help-fab:hover {
  transform: scale(1.1) rotate(10deg);
  background: #deb887;
  color: #0b1016;
  box-shadow: 0 0 20px rgba(222, 184, 135, 0.4);
}

.audio-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  transition: opacity 0.3s;
}

.mute-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  filter: grayscale(1);
  transition: filter 0.2s;
}

.audio-controls:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: #deb887;
}

.mute-btn:hover {
  filter: grayscale(0);
}

.vol-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 4px;
  background: #555;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #deb887;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}
.vol-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

/* Firefox support */
.vol-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #deb887;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

/* --- LAYOUT GRID --- */
.game-layout {
  display: grid;
  grid-template-columns: 1fr 380px; /* Fixed sidebar width */
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 10;
  transition: filter 0.5s ease;
}

/* BLUR EVERYTHING when overlay is active (God Selection / Coin) */
.game-layout.layout-blurred {
  filter: blur(8px) brightness(0.6);
  pointer-events: none;
}

/* --- OVERLAY LAYERS --- */
.overlay-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: auto;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 380px;
  min-width: 380px;
  max-width: 380px;
  overflow-x: hidden;

  background: rgba(11, 16, 22, 0.65);
  backdrop-filter: blur(12px);
  border-left: 1px solid rgba(222, 184, 135, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  gap: 2rem;
  box-shadow: -10px 0 30px rgba(0,0,0,0.5);
  z-index: 20;
  pointer-events: auto;
}

/* --- SETUP MENU --- */
.setup-menu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  color: #deb887;
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
}

.input-group input {
  background: rgba(0,0,0,0.4);
  border: 1px solid #555;
  color: white;
  padding: 0.8rem;
  border-radius: 4px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #deb887;
  background: rgba(0,0,0,0.6);
}

.start-btn {
  margin-top: 1rem;
  font-size: 1.2rem;
  letter-spacing: 1px;
  animation: pulse-gold 2s infinite;
}

.placeholder-msg {
  color: #666;
  font-style: italic;
  margin-top: 2rem;
}

/* --- BATTLEFIELD STYLES --- */
.battlefield {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
  height: 100%;
  transition: filter 0.5s ease;
}

.battlefield.blurred {
  filter: blur(4px) grayscale(0.6);
  pointer-events: none;
}

.player-zone {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: opacity 0.3s, filter 0.3s;
}
.opponent, .player { align-items: center; }
.zone-row {
  display: flex; align-items: center; gap: 1.5rem; justify-content: center;
}
.inactive-state { opacity: 0.7; filter: grayscale(0.4); }
.battle-divider {
  flex-grow: 1;
  border-left: 2px dashed rgba(255, 255, 255, 0.05);
  margin: 0 auto;
}

/* --- ANIMATIONS & GLOBAL --- */
.phase-header { text-align: center; }
.phase-text {
  font-family: 'Cinzel', serif;
  font-size: 2.2rem;
  margin: 0;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  color: #deb887;
}
.turn-indicator { margin-top: 0.5rem; color: #ccc; }
.turn-name { color: #fff; font-weight: bold; }

.control-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-start;
  padding-top: 1rem;
}

.game-controls-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.action-btn, .confirm-btn {
  width: 100%;
  padding: 1rem;
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}
.action-btn { background: #deb887; color: #0b1016; border: 2px solid #8b4513; }
.action-btn.blocked { opacity: 0.5; cursor: not-allowed; background-color: #888; border-color: #555; }
.confirm-btn { background: transparent; border: 2px solid #deb887; color: #deb887; }

.background-layer { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.blur { opacity: 80%; filter: blur(100px); width: 100%; height: 100%; position: absolute; }
.blob { width: 100%; height: 100%; background-color: #5EB16B; animation: morph 30s infinite linear; }
@keyframes morph {
  0% { clip-path: polygon(3% 2%, 37% 41%, 70% 94%, 81% 97%, 93% 98%, 8% 64%, 70% 40%, 74% 54%, 44% 21%, 2% 4%, 66% 83%, 24% 34%, 74% 94%, 29% 60%, 88% 23%, 93% 86%, 42% 86%, 67% 46%, 98% 29%, 75% 13%); }
  50% { clip-path: polygon(18% 34%, 86% 39%, 57% 52%, 10% 66%, 60% 64%, 6% 31%, 95% 90%, 28% 50%, 58% 21%, 38% 96%, 69% 76%, 4% 83%, 58% 1%, 68% 20%, 47% 6%, 69% 51%, 37% 76%, 100% 86%, 10% 45%, 99% 18%); }
  100% { clip-path: polygon(3% 2%, 37% 41%, 70% 94%, 81% 97%, 93% 98%, 8% 64%, 70% 40%, 74% 54%, 44% 21%, 2% 4%, 66% 83%, 24% 34%, 74% 94%, 29% 60%, 88% 23%, 93% 86%, 42% 86%, 67% 46%, 98% 29%, 75% 13%); }
}
@keyframes pulse-gold {
  0% { box-shadow: 0 4px 0 #8b4513; }
  50% { box-shadow: 0 4px 15px rgba(222, 184, 135, 0.6); }
  100% { box-shadow: 0 4px 0 #8b4513; }
}
</style>