<script setup lang="ts">
const props = defineProps<{
  winnerName: string;
}>();

const emit = defineEmits<(e: 'restart') => void>();
</script>

<template>
  <div class="game-over-overlay">
    <div class="content">
      <div class="title">VICTORY</div>

      <div class="winner-display">
        <div class="decoration left"></div>
        <h2 class="winner-name">{{ props.winnerName }}</h2>
        <div class="decoration right"></div>
      </div>

      <p class="subtitle">The Norns have spoken.</p>
      <button class="restart-btn" @click="emit('restart')">NEW GAME</button>
    </div>
  </div>
</template>

<style scoped>
.game-over-overlay {
  position: absolute; inset: 0; z-index: 3000;
  background: rgba(0, 0, 0, 0.85);
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(10px);
  animation: fadeIn 1s ease-out;
}

.content {
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 2rem;
  transform: scale(0.8);
  animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.title {
  font-family: 'Cinzel', serif; font-size: 4rem; color: #deb887;
  letter-spacing: 10px; text-shadow: 0 0 20px rgba(222, 184, 135, 0.5);
  margin-bottom: -1rem;
}

.winner-display {
  display: flex; align-items: center; gap: 1rem;
}

.winner-name {
  font-family: 'Cinzel', serif; font-size: 3rem; color: white; margin: 0;
  text-transform: uppercase;
}

.decoration {
  width: 50px; height: 2px; background: #deb887;
  position: relative;
}
.decoration::after {
  content: ''; position: absolute; width: 10px; height: 10px;
  background: #deb887; transform: rotate(45deg); top: -4px;
}
.decoration.left::after { right: 0; }
.decoration.left { background: linear-gradient(to right, transparent, #deb887); }
.decoration.right::after { left: 0; }
.decoration.right { background: linear-gradient(to left, transparent, #deb887); }

.subtitle { color: #888; font-style: italic; font-size: 1.2rem; }

.restart-btn {
  padding: 1rem 3rem; background: transparent; border: 2px solid #deb887;
  color: #deb887; font-family: 'Cinzel', serif; font-size: 1.5rem;
  cursor: pointer; transition: all 0.3s; margin-top: 1rem;
}
.restart-btn:hover {
  background: #deb887; color: #000; box-shadow: 0 0 20px #deb887;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleUp { from { transform: scale(0.8); } to { transform: scale(1); } }
</style>