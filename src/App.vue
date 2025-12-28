<script setup lang="ts">
import Toast from "primevue/toast"
import GameBoard from "./views/GameBoard.vue";
import { inject } from "@vercel/analytics"

inject()
</script>

<template>
  <Toast position="bottom-right" class="toast-center"/>
  <GameBoard/>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.toast-center {
  padding: 1.5rem;
  transform: translateX(8%);
}
</style>