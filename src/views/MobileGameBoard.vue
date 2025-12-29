<script setup lang="ts">
import type {useGameController} from "../composables/useGameController.ts";
import CoinToss from "../components/game/CoinToss.vue";
import GameOver from "../components/game/GameOver.vue";
import DiceSelector from "../components/game/DiceSelector.vue";
import HealthSelector from "../components/game/HealthSelector.vue";
import PlayerMat from "../components/game/PlayerMat.vue";
import GodTotems from "../components/game/GodTotems.vue";
import FavorMenu from "../components/game/FavorMenu.vue";
import type {FavorTargetType} from "../core/favors/IGodFavor.ts";
import GameRules from "../components/game/GameRules.vue";
import GodSelectionMobile from "../components/game/GodSelectionMobile.vue";
import DiceTrayMobile from "../components/game/DiceTrayMobile.vue";

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
  // volumeLevel,
  // onVolumeChange,
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
  <div class="mobile-container">

    <GameRules v-if="showRules" @close="showRules = false" />

    <div class="mobile-header">
      <button class="header-btn help-btn" @click="showRules = true" title="Rules">
        ?
      </button>

      <div class="phase-info">
        <div class="phase-badge">
          {{ setupStage === 'SETUP' ? 'SETUP' : (hasGameStarted ? phaseName : '...') }}
        </div>
        <div v-if="hasGameStarted" class="turn-info">
          {{ currentPlayer.name }}
        </div>
      </div>

      <button class="header-btn audio-btn" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
        <span v-if="!isMuted">🔊</span>
        <span v-else>🔇</span>
      </button>
    </div>

    <DiceSelector
        v-if="showDiceSelector && activeSelectorFavor"
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
    </div>

    <div class="overlay-layer" v-if="setupStage === 'COIN'">
      <CoinToss
          ref="coinRef"
          :player1-name="player1.name"
          :player2-name="player2.name"
      />
    </div>

    <div class="overlay-layer" v-if="setupStage === 'P1_SELECT'">
      <GodSelectionMobile
          :player-name="player1.name"
          @confirm="handleGodConfirmation"
      />
    </div>

    <div class="overlay-layer" v-if="setupStage === 'P2_SELECT'">
      <GodSelectionMobile
          :player-name="player2.name"
          @confirm="handleGodConfirmation"
      />
    </div>

    <div class="overlay-layer" v-if="setupStage === 'GAME_OVER'">
      <GameOver :winner-name="winnerName" @restart="handleRestart"/>
    </div>

    <div class="mobile-game" :class="{ 'blurred': isOverlayActive || setupStage === 'GAME_OVER' }">

      <div v-if="setupStage === 'SETUP'" class="setup-screen">
        <h2 class="setup-title">ORLOG</h2>

        <div class="setup-form">
          <div class="input-group">
            <label>Player 1</label>
            <input v-model="p1NameInput" placeholder="Player 1" maxlength="12" />
          </div>

          <div class="input-group">
            <label>Player 2</label>
            <input v-model="p2NameInput" placeholder="Player 2" maxlength="12" />
          </div>

          <button class="start-btn" @click="startGame">
            CHOOSE GODS
          </button>
        </div>
      </div>

      <div v-else-if="setupStage === 'PLAYING'" class="playing-screen">

        <div class="player-area opponent-area" :class="{ 'inactive': hasGameStarted && !isP2Turn }">
          <div class="player-header">
            <PlayerMat ref="p2MatRef" :player="player2" :is-active="hasGameStarted && isP2Turn" class="compact-mat" />
          </div>

          <GodTotems ref="p2TotemsRef" :player="player2" class="mobile-totems" />

          <div class="dice-zone">
            <DiceTrayMobile
                ref="p2TrayRef"
                :player="player2"
                :interactive="hasGameStarted && isP2Turn"
                :hide-kept-visuals="hideP2Kept"
                class="mobile-tray"
            />
          </div>

        </div>

        <div class="center-divider"></div>

        <div class="player-area player-area" :class="{ 'inactive': hasGameStarted && !isP1Turn }">

          <div class="dice-zone">
            <DiceTrayMobile
                ref="p1TrayRef"
                :player="player1"
                :interactive="hasGameStarted && isP1Turn"
                :hide-kept-visuals="hideP1Kept"
                class="mobile-tray"
            />
          </div>

          <GodTotems ref="p1TotemsRef" :player="player1" class="mobile-totems" />

          <div class="player-header">
            <PlayerMat ref="p1MatRef" :player="player1" :is-active="hasGameStarted && isP1Turn" class="compact-mat" />
          </div>
        </div>

      </div>

      <div v-else class="waiting-screen">
        <div class="waiting-text">Fate is being decided...</div>
      </div>

    </div>

    <div class="mobile-controls" v-if="setupStage === 'PLAYING'">

      <FavorMenu v-if="isFavorPhase" class="mobile-favor-menu" />

      <div v-else class="action-panel">
        <button
            v-if="isRollPhase"
            class="mobile-btn roll-btn"
            :class="{ 'disabled': !canRoll || isRolling }"
            :disabled="!canRoll || isRolling"
            @click.stop="handleRollClick">
          {{ isRolling ? 'ROLLING...' : 'ROLL DICE' }}
        </button>

        <button class="mobile-btn confirm-btn" @click="confirmTurn">
          {{ isRollPhase ? 'END TURN' : 'CONFIRM' }}
        </button>
      </div>

    </div>

  </div>
</template>

<style scoped>
.mobile-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0b1016;
  color: white;
  display: flex;
  flex-direction: column;
}

/*  HEADER */
.mobile-header {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(11, 16, 22, 0.95);
  border-bottom: 1px solid rgba(222, 184, 135, 0.3);
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #deb887;
  color: #deb887;
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.header-btn:active {
  transform: scale(0.95);
  background: #deb887;
  color: #0b1016;
}

.phase-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.phase-badge {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: bold;
  color: #deb887;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  letter-spacing: 1px;
}

.turn-info {
  font-size: 0.75rem;
  color: #aaa;
  font-weight: 500;
}

/*  BACKGROUND  */
.background-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blur {
  opacity: 60%;
  filter: blur(100px);
  width: 100%;
  height: 100%;
  position: absolute;
}

.blob {
  width: 100%;
  height: 100%;
  background-color: #5EB16B;
  animation: morph 30s infinite linear;
}

@keyframes morph {
  0% { clip-path: polygon(3% 2%, 37% 41%, 70% 94%, 81% 97%, 93% 98%, 8% 64%, 70% 40%, 74% 54%, 44% 21%, 2% 4%, 66% 83%, 24% 34%, 74% 94%, 29% 60%, 88% 23%, 93% 86%, 42% 86%, 67% 46%, 98% 29%, 75% 13%); }
  50% { clip-path: polygon(18% 34%, 86% 39%, 57% 52%, 10% 66%, 60% 64%, 6% 31%, 95% 90%, 28% 50%, 58% 21%, 38% 96%, 69% 76%, 4% 83%, 58% 1%, 68% 20%, 47% 6%, 69% 51%, 37% 76%, 100% 86%, 10% 45%, 99% 18%); }
  100% { clip-path: polygon(3% 2%, 37% 41%, 70% 94%, 81% 97%, 93% 98%, 8% 64%, 70% 40%, 74% 54%, 44% 21%, 2% 4%, 66% 83%, 24% 34%, 74% 94%, 29% 60%, 88% 23%, 93% 86%, 42% 86%, 67% 46%, 98% 29%, 75% 13%); }
}

/*  OVERLAYS  */
.overlay-layer {
  position: absolute;
  inset: 0;
  z-index: 200;
  pointer-events: auto;
}

/*  MAIN GAME AREA  */
.mobile-game {
  flex: 1;
  position: relative;
  z-index: 10;
  overflow-y: auto;
  overflow-x: hidden;
  transition: filter 0.3s;
}

.mobile-game.blurred {
  filter: blur(8px) brightness(0.5);
  pointer-events: none;
}

/*  SETUP SCREEN  */
.setup-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  height: 100%;
  gap: 2rem;
}

.setup-title {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  color: #deb887;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  margin: 0;
  letter-spacing: 2px;
}

.setup-form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  text-align: center;
}

.input-group input {
  background: rgba(0,0,0,0.5);
  border: 2px solid #555;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #deb887;
  background: rgba(0,0,0,0.7);
}

.start-btn {
  margin-top: 1rem;
  padding: 1.2rem;
  background: #deb887;
  color: #0b1016;
  border: 2px solid #8b4513;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(222, 184, 135, 0.4);
}

.start-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(222, 184, 135, 0.4);
}

/*  PLAYING SCREEN  */
.playing-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem 0.75rem;
  gap: 0.5rem;
}

.player-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: opacity 0.3s, filter 0.3s;
}

.player-area.inactive {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.opponent-area {
  /* Opponent at top */
}

.player-header {
  display: flex;
  justify-content: center;
}

.dice-zone {
  display: flex;
  justify-content: center;
  min-height: 80px;
}

.center-divider {
  flex: 1;
  min-height: 20px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

/*  BOTTOM CONTROLS  */
.mobile-controls {
  position: relative;
  z-index: 100;
  background: rgba(11, 16, 22, 0.95);
  border-top: 1px solid rgba(222, 184, 135, 0.3);
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
}

.action-panel {
  display: flex;
  gap: 1rem;
}

.mobile-btn {
  flex: 1;
  padding: 1rem;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid;
}

.roll-btn {
  background: #deb887;
  color: #0b1016;
  border-color: #8b4513;
  z-index: 100;
}

.roll-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #666;
  border-color: #444;
}

.roll-btn:active:not(.disabled) {
  transform: translateY(2px);
}

.confirm-btn {
  background: transparent;
  border-color: #deb887;
  color: #deb887;
}

.confirm-btn:active {
  background: rgba(222, 184, 135, 0.2);
}

/*  WAITING SCREEN  */
.waiting-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.waiting-text {
  color: #666;
  font-style: italic;
  font-size: 1.1rem;
}

/*  COMPONENT ADAPTATIONS  */
.compact-mat {
  transform: scale(0.85);
}

.mobile-tray {
  /* DiceTray should adapt to mobile */
}

.mobile-totems {
  transform: scale(0.8);
  justify-content: center;
  gap: 3rem;
}

.mobile-favor-menu {
  /* FavorMenu fills the control area */
}

/*  RESPONSIVE ADJUSTMENTS  */
@media (max-height: 700px) {
  .setup-title {
    font-size: 2rem;
  }

  .playing-screen {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  .player-area {
    gap: 0.5rem;
  }
}

@media (max-width: 360px) {
  .mobile-header {
    padding: 0.5rem 0.75rem;
  }

  .header-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .phase-badge {
    font-size: 0.9rem;
  }
}
</style>