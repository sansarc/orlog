import {computed, reactive} from "vue";
import {Game} from "../core/Game.ts";
import {useToast} from "primevue";
import {RollPhase} from "../core/phases/RollPhase.ts";


const gameInstance = reactive(new Game());

export function useGame() {
    function rollDice() {
        gameInstance.onRollClicked();
    }

    function toggleDie(die: any) {
        gameInstance.onDieClicked(die);
    }

    function confirmTurn() {
        gameInstance.onConfirmClicked();
    }

    function getPlayerRolls(player: any): number {
        if (gameInstance.phase.name === 'ROLL')
            return (gameInstance.phase as RollPhase).getRollsForPlayer(player);

        // If resolution/favor, technically rolls are "maxed" or "reset",
        return RollPhase.MAX_ROLLS;
    }

    const currentPlayer = computed(() => gameInstance.currentPlayer);
    const phaseName = computed(() => gameInstance.phase.name);
    const isRollPhase = computed(() => gameInstance.phase.name === 'ROLL');

    const player1 = computed(() => gameInstance.player1);
    const player2 = computed(() => gameInstance.player2);

    const canRoll = computed(() => {
        return gameInstance.phase.canRoll === true
    });

    const toast = useToast();
    Game.Notifier = {
        info: (msg: string) => {
            toast.add({ severity: 'info', summary: 'Info', detail: msg, life: 3000 });
        },
        error: (msg: string) => {
            toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
        },
        success: (msg: string) => {
            toast.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
        }
    }

    return {
        game: gameInstance,
        player1,
        player2,
        currentPlayer,
        canRoll,
        phaseName,
        isRollPhase,
        rollDice,
        toggleDie,
        confirmTurn,
        getPlayerRolls
    }
}
