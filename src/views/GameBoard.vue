<script setup lang="ts">
import { useGame } from "../composables/useGame.ts";
import DiceTray from "../components/game/DiceTray.vue";
import PlayerMat from "../components/game/PlayerMat.vue";
import FavorMenu from "../components/game/FavorMenu.vue";
import GodTotems from "../components/game/GodTotems.vue";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import { useTokenAnimation } from "../composables/useTokenAnimation.ts";
import type { ResolutionPhase } from "../core/phases/ResolutionPhase.ts";
import { useCombatAnimation } from "../composables/useCombatAnimation.ts";
import type { IDie } from "../core/interfaces.ts";
import CoinToss from "../components/game/CoinToss.vue";
import { Game } from "../core/Game.ts";
import type {FavorPriority, FavorTargetType, IGodFavor} from "../core/favors/IGodFavor.ts";
import GodSelection from "../components/game/GodSelection.vue";
import {audioManager} from "../core/audio/AudioManager.ts";
import DiceSelector from "../components/game/DiceSelector.vue";
import HealthSelector from "../components/game/HealthSelector.vue";
import GameRules from "../components/game/GameRules.vue";
import GameOver from "../components/game/GameOver.vue";

const { game, player1, player2, currentPlayer, rollDice, canRoll, confirmTurn, phaseName, isRollPhase, getPlayerRolls } = useGame();
const { animateTokens } = useTokenAnimation();
const { animateAttack } = useCombatAnimation();

const showRules = ref(false);
const isMuted = ref(audioManager.isMuted);
const volumeLevel = ref(audioManager.volume * 100); // 0 - 100 for the slider

const isP1Turn = computed(() => currentPlayer.value === player1.value);
const isP2Turn = computed(() => currentPlayer.value === player2.value);
const p1TrayRef = ref<InstanceType<typeof DiceTray> | null>(null);
const p2TrayRef = ref<InstanceType<typeof DiceTray> | null>(null);
const p1MatRef = ref<any>(null);
const p2MatRef = ref<any>(null);

const p1TotemsRef = ref<InstanceType<typeof GodTotems> | null>(null);
const p2TotemsRef = ref<InstanceType<typeof GodTotems> | null>(null);

const isRolling = ref(false);
const isFavorPhase = computed(() => phaseName.value === 'FAVOR');
const isResolving = ref(false);
const winnerName = ref('');

const hasGameStarted = ref(false);
const showCoin = ref(false);
const coinRef = ref<InstanceType<typeof CoinToss> | null>(null);
const p1NameInput = ref('');
const p2NameInput = ref('');

const showDiceSelector = ref(false);
const activeSelectorFavor = ref<IGodFavor | null>(null);
const activeSelectorCaster = ref<any>(null);
const showHealthSelector = ref(false);

// FLOW STATE
const setupStage = ref<'SETUP' | 'P1_SELECT' | 'P2_SELECT' | 'COIN' | 'PLAYING' | 'GAME_OVER'>('SETUP');
const isOverlayActive = computed(() => ['P1_SELECT', 'P2_SELECT', 'COIN'].includes(setupStage.value));

function toggleMute() {
  isMuted.value = audioManager.toggleMute();
}

function onVolumeChange() {
  audioManager.setMasterVolume(volumeLevel.value / 100); // convert to decimal

  if (isMuted.value && volumeLevel.value > 0)
    isMuted.value = audioManager.toggleMute();
}

onMounted(() => {
  audioManager.playBGM() // background music
});

async function startGame() {
  const p1Name = p1NameInput.value.trim() || "Player 1";
  const p2Name = p2NameInput.value.trim() || "Player 2";
  player1.value.name = p1Name;
  player2.value.name = p2Name;

  audioManager.playSFX('button-click');

  // Move to God Selection
  setupStage.value = 'P1_SELECT';
}

function handleGodConfirmation(favors: IGodFavor[]) {
  console.log(`[Setup] ${setupStage.value} confirmed with`, favors.map(f => f.name));

  if (setupStage.value === 'P1_SELECT') {
    player1.value.favors = favors;
    setupStage.value = 'P2_SELECT';
  }
  else if (setupStage.value === 'P2_SELECT') {
    player2.value.favors = favors;
    startCoinToss();
  }
}

async function startCoinToss() {
  setupStage.value = 'COIN';
  showCoin.value = true;
  await nextTick();

  const isP1First = game.firstPlayer === game.player1;
  const winnerKey = isP1First ? 'player1' : 'player2';

  if (coinRef.value) {
    await coinRef.value.spinCoin(winnerKey);
  }

  showCoin.value = false;
  setupStage.value = 'PLAYING';
  hasGameStarted.value = true; // Board becomes interactive

  Game.Notifier.info(`Game Started! ${currentPlayer.value.name} goes first.`);
}

const hideP1Kept = computed(() => !isRollPhase.value || getPlayerRolls(player1.value) >= 3);
const hideP2Kept = computed(() => !isRollPhase.value || getPlayerRolls(player2.value) >= 3);

function handleRollClick() {
  if (isRolling.value || !canRoll.value) return;
  isRolling.value = true;

  try {
    const currentDice = currentPlayer.value.dice;
    const indicesToAnimate = currentDice
        .map((die, index) => die.isKept ? -1 : index)
        .filter(index => index !== -1);

    rollDice();

    nextTick(() => {
      const activeTray = isP1Turn.value ? p1TrayRef.value : p2TrayRef.value;
      if (activeTray)
        activeTray.playRollAnimation(indicesToAnimate);
    });
  } finally {
    setTimeout(() => isRolling.value = false, 600);
  }
}

watch(phaseName, async (newPhase) => {
  if (newPhase === 'RESOLUTION') {
    if (isResolving.value) return;

    isResolving.value = true;
    await runResolutionSequence();
    isResolving.value = false;
  }
});

async function runResolutionSequence() {
  const resolution = game.phase as ResolutionPhase;
  const visuallyConsumed = new Map<IDie, number>();

  console.log('[Resolution] Starting sequence');

  // 1. Tokens (Parallel Animation)
  const p1Promise = new Promise<void>(resolve => {
    const tokens = p1TrayRef.value?.getDiceElementsWithTokens() || [];
    const target = p1MatRef.value?.getTokenElement();
    animateTokens(tokens, target, resolve, true);
  });

  const p2Promise = new Promise<void>(resolve => {
    const tokens = p2TrayRef.value?.getDiceElementsWithTokens() || [];
    const target = p2MatRef.value?.getTokenElement();
    animateTokens(tokens, target, resolve);
  });

  await Promise.all([p1Promise, p2Promise]);

  resolution.resolveTokenGains();
  console.log('[Resolution] Token gains resolved');
  await wait(1000);

  // 2. Pre-Combat Favors
  await resolveFavorsByPriority('IMMEDIATE')
  await resolveFavorsByPriority('PRE_COMBAT')

  const p1Count = player1.value.dice.length;
  const p2Count = player2.value.dice.length;
  const maxDice = Math.max(p1Count, p2Count, 6);

  // 3. Combat
  for (let i = 0; i < maxDice; i++)
    await handleCombatStep(i, resolution, visuallyConsumed);

  if (checkWinCondition()) return;

  // 4. Post-Combat Favors
  await resolveFavorsByPriority('POST_COMBAT');
  console.log('[Resolution] Combat complete');

  if (checkWinCondition()) return;

  resolution.endPhase();
}

async function resolveFavorsByPriority(priority: FavorPriority) {
  const resolution = game.phase as ResolutionPhase;
  const first = game.firstPlayer;
  const second = game.getOtherPlayer(first);

  await handleSingleFavor(first, second, resolution, priority);
  await handleSingleFavor(second, first, resolution, priority);
}

async function handleSingleFavor(
    caster: any,
    opponent: any,
    resolution: ResolutionPhase,
    priority: FavorPriority
) {
  const selection = caster.selectedFavor;
  if (!selection || selection.favor.priority !== priority) return;

  const { favor, level } = selection;

  // 1. Capture state BEFORE execution
  const prevCount = caster.dice.length;

  // 2. Cost Check
  if (caster.tokens < favor.getCost(level)) {
    await wait(1000);
    // Resolve anyway to clear the selection/state
    resolution.resolvePlayerFavor(caster, opponent, priority);
    return;
  }

  // 3. Execution Paths
  if (favor.targetType && favor.targetType !== 'NONE') {

    activeSelectorFavor.value = favor;
    activeSelectorCaster.value = caster;

    // HEALTH INTERACTION
    if (favor.targetType === 'SELF_HEALTH') {
      showHealthSelector.value = true;
    }
    // DICE INTERACTION
    else {
      showDiceSelector.value = true;
    }

    // Pause here until ANY modal emits confirm/cancel
    await waitForModalSelection();

    // Cleanup
    showDiceSelector.value = false;
    showHealthSelector.value = false;
    activeSelectorFavor.value = null;
    activeSelectorCaster.value = null;
  }
  else {
    // NON-INTERACTIVE PATH
    const isP1 = (caster === player1.value);
    const totemsComponent = isP1 ? p1TotemsRef.value : p2TotemsRef.value;

    if (totemsComponent) {
      await totemsComponent.playActivation(favor.name);
    }

    resolution.resolvePlayerFavor(caster, opponent, priority);
  }

  // 4. POST-EXECUTION
  // This runs regardless of which path was taken
  const newCount = caster.dice.length;

  if (newCount > prevCount) {
    const addedCount = newCount - prevCount;
    const newIndices: number[] = [];

    // Calculate indices of the new dice (e.g., 6, 7)
    for (let i = 0; i < addedCount; i++) {
      newIndices.push(prevCount + i);
    }

    // Trigger Roll Animation on Tray
    const tray = (caster === player1.value) ? p1TrayRef.value : p2TrayRef.value;
    if (tray) {
      // Forcing a Vue update before animating
      await nextTick();
      tray.playRollAnimation(newIndices);
      await wait(800); // Waiting for roll to finish
    }
  }

  await wait(500); // Small pause before next step
}

// HEALTH CALLBACK
async function onHealthConfirm(amount: number) {
  showHealthSelector.value = false;

  if (!activeSelectorFavor.value || !activeSelectorCaster.value) return;

  const favor = activeSelectorFavor.value;
  const caster = activeSelectorCaster.value;
  const opponent = game.getOtherPlayer(caster);
  const resolution = game.phase as ResolutionPhase;

  // Animation
  await playFavorAnimation(caster, favor);

  // Backend Execution
  resolution.resolvePlayerFavor(caster, opponent, favor.priority, amount);

  // Resume
  if (modalResolver) modalResolver(true);
}

function onHealthCancel() {
  showHealthSelector.value = false;
  if (modalResolver) modalResolver(false);
}

let modalResolver: ((value: unknown) => void) | null = null

function waitForModalSelection() {
  return new Promise(resolve => modalResolver = resolve);
}

// MODAL CALLBACKS
async function onSelectorConfirm(selectedDice: IDie[]) {
  showDiceSelector.value = false;

  // safety checks
  if (!activeSelectorFavor.value || !activeSelectorCaster.value) return;

  try {
    const favor = activeSelectorFavor.value;
    const caster = activeSelectorCaster.value;
    const opponent = game.getOtherPlayer(caster);
    const resolution = game.phase as ResolutionPhase;

    await playFavorAnimation(caster, favor); // Ensure this function exists/works

    // backend success
    const success = resolution.resolvePlayerFavor(
        caster,
        opponent,
        favor.priority,
        selectedDice
    );

    if (success) {
      const p1Indices = player1.value.dice
          .map((d, i) => selectedDice.includes(d) ? i : -1)
          .filter(i => i !== -1);

      const p2Indices = player2.value.dice
          .map((d, i) => selectedDice.includes(d) ? i : -1)
          .filter(i => i !== -1);

      if (p1Indices.length > 0 && p1TrayRef.value)
        p1TrayRef.value.playRollAnimation(p1Indices);

      if (p2Indices.length > 0 && p2TrayRef.value)
        p2TrayRef.value.playRollAnimation(p1Indices);

      // wait for animation to finish
      if (p1Indices.length > 0 || p2Indices.length > 0)
        await wait(600);

    }

    // resume Game Loop
    if (modalResolver) {
      modalResolver(true);
      modalResolver = null; // Clean up
    }

  } catch (err) {
    console.error("Favor Error:", err);
    if (modalResolver) modalResolver(false);
  }
}

async function playFavorAnimation(caster: any, favor: IGodFavor) {
  const isP1 = (caster === player1.value);
  const totemsComponent = isP1 ? p1TotemsRef.value : p2TotemsRef.value;

  if (totemsComponent) {
    await totemsComponent.playActivation(favor.name);
  }
}

function onSelectorCancel() {
  // If selection is skipped, you lose token anyway, choose wisely...
  showDiceSelector.value = false;
  if (modalResolver) modalResolver(false);
}

async function handleCombatStep(index: number, resolution: ResolutionPhase, consumedDice: Map<IDie, number>) {
  const p1Die = player1.value.dice[index];
  const p2Die = player2.value.dice[index];

  if (p1Die || p2Die) {
    const activeFaces = new Set(['AXE', 'ARROW', 'HAND']);
    let didAnimate = false;

    if (p1Die && !p1Die.isResolved && activeFaces.has(p1Die.face)) {
      await resolveSingleDieAnimation(p1Die, player1.value, player2.value, p1TrayRef, p2TrayRef, p2MatRef, consumedDice);
      didAnimate = true;
    }

    if (p2Die && !p2Die.isResolved && activeFaces.has(p2Die.face)) {
      await resolveSingleDieAnimation(p2Die, player2.value, player1.value, p2TrayRef, p1TrayRef, p1MatRef, consumedDice);
      didAnimate = true;
    }

    resolution.resolveCombatAtIndex(index);

    await wait(didAnimate ? 500 : 800);
  }
}

async function resolveSingleDieAnimation(
    attackerDie: IDie,
    _attacker: any, defender: any,
    attackerTray: any, defenderTray: any,
    defenderMat: any,
    consumedDice: Map<IDie, number>
) {
  // Safe check for tray existence
  if (!attackerTray.value) return;

  const dieEl = attackerTray.value.getDiceElement(attackerDie);
  if (!dieEl) {
    console.warn('[Combat] Die element not found for animation');
    return;
  }

  let targetEl: HTMLElement | null = null;
  let isBlocked = false;

  if (attackerDie.face === 'AXE') {
    const helmet = defender.dice.find((die: IDie) =>
        die.face === 'HELMET' &&
        !die.isResolved &&
        (consumedDice.get(die) || 0) < die.defenseHealth
    );

    if (helmet) {
      targetEl = defenderTray.value?.getDiceElement(helmet);
      isBlocked = true;
      const currentCount = consumedDice.get(helmet) || 0;
      consumedDice.set(helmet, currentCount + 1);
    }
    else {
      targetEl = defenderMat.value?.getElement();
    }
  }
  else if (attackerDie.face === 'ARROW') {
    const shield = defender.dice.find((die: IDie) =>
        die.face === 'SHIELD' &&
        !die.isResolved &&
        (consumedDice.get(die) || 0) < die.defenseHealth
    );

    if (shield) {
      targetEl = defenderTray.value?.getDiceElement(shield);
      isBlocked = true;
      const currentCount = consumedDice.get(shield) || 0;
      consumedDice.set(shield, currentCount + 1);
    }
    else
      targetEl = defenderMat.value?.getElement();
  }
  else if (attackerDie.face === 'HAND')
    targetEl = defenderMat.value?.getElement();

  if (targetEl)
    await animateAttack(dieEl, targetEl, isBlocked, attackerDie);

  console.log(`[Combat] ${attackerDie.face} attack, blocked: ${isBlocked}`);
}

function checkWinCondition(): boolean {
  console.log(`[Health] P1: ${player1.value.health}, P2: ${player2.value.health}`);

  const p1Dead = player1.value.health <= 0;
  const p2Dead = player2.value.health <= 0;

  if (p1Dead || p2Dead) {
    console.log(`[Game] Winner: ${winnerName.value}`);


    if (p1Dead && p2Dead)
      winnerName.value = "Draw";
    else if (p1Dead)
      winnerName.value = player2.value.name;
    else
      winnerName.value = player1.value.name;


    // TRIGGER GAME OVER
    setupStage.value = 'GAME_OVER';

    audioManager.stopBGM();
    audioManager.playSFX('game-end');

    return true;
  }

  return false;
}

function handleRestart() {
  game.resetGame();
  winnerName.value = '';
  setupStage.value = 'P1_SELECT';
  audioManager.playBGM();
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
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
  display: flex;
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