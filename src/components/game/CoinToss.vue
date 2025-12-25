<script setup lang="ts">
import gsap from "gsap";
import {ref} from "vue";

const props = defineProps<{ player1Name: string, player2Name: string }>();

const coinEl = ref<HTMLElement | null>(null);
const resultText = ref('WHO GOES FIRST?');

// expose flip action to parent
function spinCoin(winner: "player1" | "player2"): Promise<void> {
  return new Promise(resolve => {
    if (!coinEl.value) {
      resolve();
      return;
    }

    // determine end rotation:
    // 0 deg = Player 1 (Heads)
    // 180 deg = Player 2 (Tails)
    // add plenty of full spins (360 * 5) for effect

    const baseSpins = 360 * 8;
    const targetRotation = winner === 'player1' ? baseSpins : baseSpins + 180;

    const tl = gsap.timeline({
      onComplete: () => {
        resultText.value = winner === 'player1'
          ? `${props.player1Name.toUpperCase()} STARTS!`
          : `${props.player2Name.toUpperCase()} STARTS`;

        setTimeout(resolve, 1500);
      }
    });

    // toss up
    tl.to(coinEl.value, {
      rotationX: targetRotation,
      y: -200,
      scale: 1.5,
      duration: 1.5,
      ease: 'power2.out'
    })
    // land down
    .to(coinEl.value, {
      y: 0,
      scale: 1,
      duration: 1,
      ease: 'bounce.out'
    });
  });
}

defineExpose({ spinCoin });
</script>

<template>
  <div class="coin-overlay">
    <div class="coin-scene">
      <div ref="coinEl" class="coin">
        <div class="coin-face front">
          <div class="face-text">{{ player1Name.charAt(0).toUpperCase() }}</div>
        </div>
        <div class="coin-face back">
          <div class="face-text">{{ player2Name.charAt(0).toUpperCase() }}</div>
        </div>
      </div>
    </div>
    <h2 class="result-text">{{ resultText }}</h2>
  </div>
</template>

<style scoped>
.coin-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  backdrop-filter: blur(5px);
}

.coin-scene {
  width: 150px;
  height: 150px;
  perspective: 1000px;
  margin-bottom: 2rem;
}

.coin {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  /* Start showing Player 1 */
  transform: rotateX(0deg);
  z-index: 9999;
}

.coin-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden; /* Hides the back when facing away */
  border: 4px solid #b8860b; /* Dark Gold Border */
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.face-text {
  font-family: 'Cinzel', serif;
  font-size: 4rem;
  font-weight: bold;
  color: #5c4033; /* Dark Wood/Bronze text */
  text-shadow: 1px 1px 0 rgba(255,255,255,0.4);
}

/* FRONT (Heads) */
.front {
  background: radial-gradient(circle at 30% 30%, #ffd700, #deb887);
  transform: rotateX(0deg);
}

/* BACK (Tails) - must be rotated 180 initially to face away */
.back {
  background: radial-gradient(circle at 30% 30%, #c0c0c0, #a9a9a9); /* Silver/Iron look for P2 */
  transform: rotateX(180deg);
}

.result-text {
  color: #ffd700;
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  text-shadow: 0 2px 10px black;
  min-height: 3rem;
}
</style>