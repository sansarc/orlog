<script setup lang="ts">
import type {IGodFavor} from "../../core/favors/IGodFavor.ts";
import type { IPlayer } from "../../core/interfaces.ts";
import {useFavorAnimation} from "../../composables/useFavorAnimation.ts";
import {ref} from "vue";
import {audioManager} from "../../core/audio/AudioManager.ts";

defineProps<{
  player: IPlayer;
}>();

const animateFavorAction = useFavorAnimation();

const totemRefs = ref<Record<string, HTMLElement | null>>({});
const setTotemRefs = (el: any, name: string) => {
  if (el) 
    totemRefs.value[name] = el as HTMLElement;
};

async function playActivation(favorName: string) {
  const el = totemRefs.value[favorName];
  console.log(`GodTotems: Activating '${favorName}'`, el ? "Element Found" : "ELEMENT NOT FOUND");
  if (el)
    await animateFavorAction(el);

  if (favorName === "Thor's Strike")
    audioManager.playSFX('thors-strike');
}

defineExpose({ playActivation });

function getTooltip(favor: IGodFavor) {
  return favor.getDescription(0);
}
</script>

<template>
  <div class="totems-container">
    <div
        v-for="favor in player.favors"
        :key="favor.name"
        class="totem-wrapper"
    >
      <div :ref="(el) => setTotemRefs(el, favor.name)" class="totem-glow"></div>

      <div class="totem-inner">
        <img :src="favor.totemImgPath"
             alt="{{ favor.name }} totem"
             class="god-figure"
             @error="($event: Event) => {
               const target = $event.target as HTMLImageElement;
               if (target)
                 target.src = '/icons/placeholder_god.png';
             }"
        />
      </div>

      <div class="tooltip">
        <div class="tooltip-title">{{ favor.name }}</div>
        <div class="tooltip-desc">{{ getTooltip(favor) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.totems-container {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  /* Glass background for the totem stand */
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  height: 80px;
  align-items: center;
  overflow: visible;
}

.totem-wrapper {
  position: relative;
  width: 40px;
  height: 60px;
  cursor: help;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.totem-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 215, 0, 0.8) 40%, rgba(255, 215, 0, 0) 70%);

  border-radius: 50%;
  opacity: 0;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  filter: blur(5px); /* Soften edges */
}

.totem-inner {
  z-index: 1;
  width: 100%;
  height: 100%;
  transition: transform 0.2s;
}

.totem-wrapper:hover {
  transform: translateY(-5px) scale(1.15);
  z-index: 10;
}

.god-figure {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.8));
}

/* --- TOOLTIP STYLES --- */
.tooltip {
  position: absolute;
  bottom: 100%; /* Position above the figure */
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  width: 180px;
  background: rgba(15, 20, 25, 0.95);
  border: 1px solid #deb887;
  padding: 0.8rem;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.9);
  text-align: center;
  z-index: 100;
}

.totem-wrapper:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-15px);
}

.tooltip-title {
  color: #deb887; /* Gold */
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  font-weight: bold;
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.tooltip-desc {
  color: #ccc;
  font-size: 0.8rem;
  line-height: 1.3;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #deb887 transparent transparent transparent;
}
</style>