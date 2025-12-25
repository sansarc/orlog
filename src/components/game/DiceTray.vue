<script setup lang="ts">

import {useGame} from "../../composables/useGame.ts";
import {computed, ref} from "vue";
import Die from "./Die.vue";
import type {IDie, IPlayer} from "../../core/interfaces.ts";
import {audioManager} from "../../core/audio/AudioManager.ts";

const props = defineProps<{
  player: IPlayer;
  interactive?: boolean;
  hideKeptVisuals?: boolean;
}>();

const { toggleDie } = useGame();
const dice = computed(() => props.player.dice);
const dieComponents = ref<InstanceType<typeof Die>[]>([]);

function onDieClick(die: any) {
  if (props.interactive)
    toggleDie(die);
}

/**
 * Helper to map Die Objects -> DOM Elements
 * > Because of the parallel arrays (props.player.dice AND dieComponents), it needs to find the index.
 */
function getDiceElement(dieObject: IDie): HTMLElement | null {
  const index = props.player.dice.indexOf(dieObject);
  if (index === -1)
    return null;

  const comp = dieComponents.value[index];
  return comp ? comp.getElement() : null; // Assuming Die.vue exposes getElement()
}

function playRollAnimation(forceIndices?: number[]) {
  const filename = 'dice-roll-' + (Math.floor(Math.random() * 9) + 1)
  audioManager.playSFX(filename);

  dieComponents.value.forEach((comp, index) => {
    if (!comp) return;

    if (forceIndices) {
      if (forceIndices.includes(index))
        comp.animateRoll();
    }
    else {
      const dieData = dice.value[index];
      if (dieData) {
        if (!dieData.isKept)
          comp.animateRoll();
      }
    }
  });
}

function getDiceElementsWithTokens(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  dieComponents.value.forEach((comp, index) => {
    const die = dice.value[index];

    if (die) {
      if (die.hasToken && comp) {
        const el = comp.getElement();
        if (el)
          elements.push(el);
      }
    }
  });

  return elements;
}

defineExpose({
  playRollAnimation,
  getDiceElementsWithTokens,
  getDiceElement
});
</script>

<template>
  <div class="dice-tray" :class="{ 'is-disabled': !interactive }">
    <Die
        v-for="(die, index) in dice"
        ref="dieComponents"
        :key="index"
        :die="die"
        :interactive="interactive"
        :hide-kept-visuals="hideKeptVisuals"
        @click="onDieClick"
    />
  </div>
</template>

<style scoped>
.dice-tray {
  display: flex;
  gap: 1rem;
  padding: 2.7rem;
  background-color: #3d2107;
  border-radius: 12px;
  justify-content: center;
  min-height: 80px;
  transition: opacity 0.3s;
}

.is-disabled {
  opacity: 1;
  pointer-events: none;
}
</style>