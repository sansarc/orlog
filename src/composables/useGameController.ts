import {useCombatAnimation} from "./useCombatAnimation.ts";
import {useGame} from "./useGame.ts";
import {useTokenAnimation} from "./useTokenAnimation.ts";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {audioManager} from "../core/audio/AudioManager.ts";
import type DiceTray from "../components/game/DiceTray.vue";
import type GodTotems from "../components/game/GodTotems.vue";
import type CoinToss from "../components/game/CoinToss.vue";
import type {FavorPriority, IGodFavor} from "../core/favors/IGodFavor.ts";
import {Game} from "../core/Game.ts";
import type {ResolutionPhase} from "../core/phases/ResolutionPhase.ts";
import type {IDie} from "../core/interfaces.ts";

export function useGameController() {

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
        if (selection?.favor.priority !== priority) return;

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

    return {
        /* =======================
           CORE GAME (from useGame)
           ======================= */
        game,
        player1,
        player2,
        currentPlayer,
        rollDice,
        canRoll,
        confirmTurn,
        phaseName,
        isRollPhase,
        getPlayerRolls,

        /* =======================
           ANIMATION COMPOSABLES
           ======================= */
        animateTokens,
        animateAttack,

        /* =======================
           UI / SETTINGS
           ======================= */
        showRules,
        isMuted,
        volumeLevel,
        toggleMute,
        onVolumeChange,

        /* =======================
           TURN / PLAYER STATE
           ======================= */
        isP1Turn,
        isP2Turn,

        /* =======================
           REFS — BOARD / TRAYS
           ======================= */
        p1TrayRef,
        p2TrayRef,
        p1MatRef,
        p2MatRef,

        /* =======================
           REFS — TOTEMS / COIN
           ======================= */
        p1TotemsRef,
        p2TotemsRef,
        coinRef,

        /* =======================
           GAME FLOW FLAGS
           ======================= */
        isRolling,
        isFavorPhase,
        isResolving,
        hasGameStarted,
        showCoin,
        winnerName,

        /* =======================
           SETUP FLOW
           ======================= */
        setupStage,
        isOverlayActive,
        startGame,
        handleGodConfirmation,
        startCoinToss,
        handleRestart,

        /* =======================
           PLAYER INPUT
           ======================= */
        p1NameInput,
        p2NameInput,

        /* =======================
           DICE UI HELPERS
           ======================= */
        hideP1Kept,
        hideP2Kept,
        handleRollClick,

        /* =======================
           FAVOR / MODAL STATE
           ======================= */
        showDiceSelector,
        showHealthSelector,
        activeSelectorFavor,
        activeSelectorCaster,

        /* =======================
           FAVOR MODAL CALLBACKS
           ======================= */
        onSelectorConfirm,
        onSelectorCancel,
        onHealthConfirm,
        onHealthCancel,

        /* =======================
           RESOLUTION SYSTEM
           ======================= */
        runResolutionSequence,
        resolveFavorsByPriority,
        handleSingleFavor,
        playFavorAnimation,

        /* =======================
           COMBAT SYSTEM
           ======================= */
        handleCombatStep,
        resolveSingleDieAnimation,

        /* =======================
           GAME END
           ======================= */
        checkWinCondition,

        /* =======================
           MODAL CONTROL
           ======================= */
        waitForModalSelection,

        /* =======================
           UTILITIES
           ======================= */
        wait,
    }

}