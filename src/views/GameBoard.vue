<script setup lang="ts">
import {defineAsyncComponent, onMounted, onUnmounted, ref} from "vue";
import {useGameController} from "../composables/useGameController.ts";

const DesktopGameBoard = defineAsyncComponent(() => import('./DesktopGameBoard.vue'))
const MobileGameBoard = defineAsyncComponent(() => import('./MobileGameBoard.vue'))

const controller = useGameController();

const isMobile = ref(window.innerWidth <= 768);
function updateWidth() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(() => window.addEventListener("resize", updateWidth));
onUnmounted(() => window.removeEventListener("resize", updateWidth));
</script>

<template>
  <div class="app-root">
    <component
        :is="isMobile ? MobileGameBoard : DesktopGameBoard"
        :controller="controller"
    />
  </div>
</template>

<style>
/* Global resets, if needed */
.app-root { width: 100vw; height: 100vh; overflow: hidden; }
</style>