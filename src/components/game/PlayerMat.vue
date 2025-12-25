<script setup lang="ts">
import {computed, ref} from "vue";
import type { IPlayer } from "../../core/interfaces";

const props = defineProps<{
  player: IPlayer;
  isActive: boolean;
}>();

const maxHealth = 15;
const stones = computed(() => Array.from({ length: props.player.health }));

const tokenIconRef = ref<HTMLElement | null>(null);
const rootEl = ref<HTMLElement | null>(null);

defineExpose({
  getTokenElement: () => tokenIconRef.value,
  getElement: () => rootEl.value
});

</script>

<template>
  <div ref="rootEl" class="player-mat" :class="{ 'active-turn': isActive }">
    <div class="info">
      <h2 class="player-name">{{ player.name }}</h2>

      <div class="token-counter">
        <span ref="tokenIconRef" class="token-icon">⌘</span>
        <span class="token-value">{{ player.tokens }}</span>
      </div>
    </div>

    <div class="health-container">
      <div
          v-for="(_, i) in stones"
          :key="i"
          class="health-stone"
      ></div>
      <div
          v-for="i in (maxHealth - player.health)"
          :key="`lost-${i}`"
          class="health-stone lost"
      ></div>
    </div>

  </div>
</template>

<style scoped>
.player-mat {
  width: 100%;
  max-width: 600px;
  padding: 1rem;
  transition: opacity 0.3s;
}

.active-turn {
  opacity: 1;
}

.player-mat:not(.active-turn) {
  opacity: 0.6;
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.player-name {
  font-family: 'Cinzel', serif;
  margin: 0;
  color: #deb887;
  font-size: 1.5rem;
}

.token-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0,0,0,0.4);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #deb887;
}

.token-icon {
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: bold;
}

.token-value {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.health-container {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.health-stone {
  width: 16px;
  height: 16px;
  background-color: #5eff5e;
  border-radius: 50%;
  box-shadow: 0 0 5px #5eff5e;
}

.health-stone.lost {
  background-color: #333;
  box-shadow: none;
  border: 1px solid #555;
}
</style>