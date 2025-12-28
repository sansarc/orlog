<script setup lang="ts">
const emit = defineEmits<(e: 'close') => void>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="rules-modal">

      <div class="modal-header">
        <h2>How to Play Orlog</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="scroll-content">
        <section>
          <h3>Goal</h3>
          <p>
            Reduce your opponent's Health from 15 to 0.
            Use Dice attacks and God Favors to win.
          </p>
        </section>

        <section>
          <h3>Dice Faces</h3>
          <ul class="legend">
            <li><span class="icon">🪓</span> <b>Axe:</b> Deals 1 damage (Melee).</li>
            <li><span class="icon">🏹</span> <b>Arrow:</b> Deals 1 damage (Ranged).</li>
            <li><span class="icon">🛡️</span> <b>Shield:</b> Blocks 1 Axe.</li>
            <li><span class="icon">🪖</span> <b>Helmet:</b> Blocks 1 Arrow.</li>
            <li><span class="icon">🖐️</span> <b>Hand:</b> Steals 1 God Token (Power).</li>
          </ul>
          <p class="note">
            Dice with a Gold Border grant 1 God Token
            (<span class="token-icon">⌘</span>).
          </p>
        </section>

        <section class="game-phases">
          <h3>Game Phases</h3>
          <ol>
            <li>
              <b>Roll Phase:</b>
              Roll dice 3 times. Lock in the ones you want to keep.
            </li>
            <li>
              <b>God Favor Phase:</b>
              Spend tokens to activate powerful abilities
              (e.g., Thor's Strike).
            </li>
            <li>
              <b>Resolution Phase:</b>
              <ul>
                <li>Dice compare against each other (Axes vs Helmets, etc).</li>
                <li>God Favors activate.</li>
                <li>Damage is dealt.</li>
              </ul>
            </li>
          </ol>
        </section>
      </div>

      <div class="modal-footer">
        <p>
          Made by
          <a href="https://github.com/sansarc/orlog" target="_blank">
            sansarc
          </a>
        </p>
        <p class="version">v1.0.0</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.token-icon {
  display: inline-block;
  color: #ffd700;
  font-size: 1rem;
  font-weight: bold;
  transform: skewX(-10deg);
  text-shadow: 0 0 8px #ffd700, 0 0 16px #ffa500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.rules-modal {
  background: #151a21;
  border: 1px solid #deb887;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a2029;
  border-radius: 8px 8px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #deb887;
  font-family: 'Cinzel', serif;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 2rem;
  cursor: pointer;
  line-height: 0.5;
}

.close-btn:hover {
  color: #fff;
}

.scroll-content {
  padding: 1.5rem;
  overflow-y: auto;
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: left;
}

section {
  margin-bottom: 1.5rem;
}

h3 {
  color: #ffd700;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
  margin-top: 0;
}

.scroll-content ol,
.scroll-content ul {
  padding-left: 1.2rem;
  text-align: left;
}

.scroll-content li {
  text-align: left;
}

/* Dice legend */
.legend {
  list-style: none;
  padding-left: 0;
}

.legend li {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.2rem;
  width: 30px;
  text-align: center;
}

.note {
  font-style: italic;
  color: #888;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem;
  background: #0b1016;
  border-top: 1px solid #333;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  border-radius: 0 0 8px 8px;
}

.modal-footer a {
  color: #deb887;
  text-decoration: none;
  font-weight: bold;
}

.modal-footer a:hover {
  text-decoration: underline;
}

.version {
  font-size: 0.75rem;
  margin-top: 0.3rem;
  opacity: 0.5;
}
</style>
