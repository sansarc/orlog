<script setup lang="ts">

import {computed, ref} from "vue";
import gsap from "gsap";
import type { IDie } from "../../core/interfaces.ts";

const props = defineProps<{
  die: IDie;
  interactive?: boolean;
  hideKeptVisuals?: boolean;
}>();

const emit = defineEmits(['click']);
const dieRef = ref<HTMLElement | null>(null);

defineExpose({
  animateRoll,
  getElement: () => dieRef.value
});

const icon = computed(() => {
  switch (props.die.face) {
    case 'AXE': return '/icons/axe.png';
    case 'SHIELD': return '/icons/shield.png';
    case 'HELMET': return '/icons/helmet.png';
    case 'ARROW': return '/icons/arrow.png';
    case 'HAND': return '/icons/hand.png';
    default: return null;
  }
});

function animateRoll() {
  if (!dieRef.value) return;

  const tl = gsap.timeline();
  tl.to(dieRef.value, { rotation: 360, duration: 0.5, ease: "back.out(1.7)" })
      .to(dieRef.value, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 }, "<")
      .set(dieRef.value, { scale: 1, rotation: 0 });
}

function onClick() {
  if (props.interactive)
    emit('click', props.die);
}
</script>

<template>
  <div
      ref="dieRef"
      class="die-container"
      :class="{
        'is-kept': die.isKept && !hideKeptVisuals,
        'has-token': die.hasToken,
        'is-locked': die.isLocked,
        'is-resolved': die.isResolved,
        'is-temporary': die.isTemporary
      }"
      @click="onClick"
  >
    <img
        v-if="icon"
        :src="icon"
        class="die-face"
        :alt="`Die face: ${die.face}`"
    />

    <div v-if="die.hasToken" class="token-glow"></div>

    <div v-if="die.defenseHealth > 1" class="buff-badge defense">
      +{{ die.defenseHealth - 1 }}
    </div>

    <div v-if="die.damage > 1" class="buff-badge attack">
      {{ die.damage }}x
    </div>

  </div>
</template>

<style scoped>
.die-face {
  width: 90%;
  height: 90%;
  object-fit: contain;
  pointer-events: none;
}

.die-container {
  width: 40px;
  height: 40px;
  border-radius: 3px;
  background-color: #e0d5b7;
  box-shadow: 0 4px 6px rgba(0,0,0,3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.die-container:hover {
  transform: translateY(-2px);
}

.is-kept {
  border: 3px solid #42b883;
  box-shadow: 0 0 15px #42b883;
}

.is-resolved {
  opacity: 0.4;
  filter: grayscale(100%);
  transform: scale(0.9);
  border-color: #333 !important;
  box-shadow: none !important;
  transition: all 0.5s ease;
}

.token-glow {
  position: absolute;
  inset: -2px;
  border: 2px dashed #ffd700;   /* keep the original thin dashed border */
  border-radius: 5px;
  pointer-events: none;

  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%   { box-shadow: 0 0 4px rgba(255,215,0,0.4); }
  50%  { box-shadow: 0 0 12px rgba(255,215,0,0.9); }
  100% { box-shadow: 0 0 4px rgba(255,215,0,0.4); }
}

.buff-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #3498db; /* Blue for defense buff */
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.defense {
  background: #3498db; /* Blue */
}

.attack {
  background: #e74c3c; /* Red */
}

.attack + .defense {
  right: 18px; /* Shift left */
}

@keyframes popIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.is-temporary {
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6) !important;
  border-color: #ffd700 !important;
  animation: spectralPulse 2s infinite alternate;
}

@keyframes spectralPulse {
  from { filter: brightness(1); }
  to { filter: brightness(1.3) drop-shadow(0 0 5px gold); }
}
</style>