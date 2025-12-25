import type {IGamePhase} from "./IGamePhase.ts";
import {FavorPhase} from "./FavorPhase.ts";
import {Game} from "../Game.ts";
import type {Die} from "../Die.ts";
import type {Player} from "../Player.ts";

export class RollPhase implements IGamePhase {
    static readonly MAX_ROLLS = 3;
    private _hasRolledThisTurn = false;

    readonly name = "ROLL";
    private readonly _game: Game;
    private _player1RollsCount = 0;
    private _player2RollsCount = 0;

    constructor(game: Game) {
        this._game = game;
    }

    public getRollsForPlayer(player: Player): number {
        if (player === this._game.player1)
            return this._player1RollsCount;
        else
            return this._player2RollsCount;
    }

    private get currentPlayerRollCount(): number {
        return this._game.currentPlayer === this._game.player1
            ? this._player1RollsCount
            : this._player2RollsCount;
    }

    private incrementCurrentPlayerRollCount(): void {
        this._game.currentPlayer === this._game.player1
            ? this._player1RollsCount++
            : this._player2RollsCount++;
    }

    handleRollClick(): void {
        const currentPlayer = this._game.currentPlayer;

        if (this._hasRolledThisTurn) {
            Game.Notifier.info("You have already rolled this turn. End your turn.");
            return;
        }

        if (this.currentPlayerRollCount >= RollPhase.MAX_ROLLS) {
            Game.Notifier.error("You have no rolls left.");
            return;
        }

        currentPlayer.rollDice();
        this.incrementCurrentPlayerRollCount();
        this._hasRolledThisTurn = true;

        if (this.currentPlayerRollCount === RollPhase.MAX_ROLLS) {
            if (this._game.currentPlayer === this._game.firstPlayer)
                Game.Notifier.info("Last roll! All dice are kept.");

            currentPlayer.keepAllDice();
        }
    }

    handleConfirmClick() {
        const currentPlayer = this._game.currentPlayer;

        if (!this._hasRolledThisTurn && this.currentPlayerRollCount < RollPhase.MAX_ROLLS) {
            Game.Notifier.error("You must roll before confirming!");
            return;
        }

        currentPlayer.dice.forEach(die => {
            if (die.isKept)
                die.isLocked = true;
        });

        if (this._player1RollsCount === RollPhase.MAX_ROLLS && this._player2RollsCount === RollPhase.MAX_ROLLS) {
            this.endPhase();
            return;
        }

        this._game.currentPlayer = this._game.getOtherPlayer(currentPlayer);
        this._hasRolledThisTurn = false;
    }

    handleDieClick(die: Die): void {
        const currentPlayer = this._game.currentPlayer;

        const isPlayer1 = currentPlayer === this._game.player1;
        const dieBelongsToCurrent = isPlayer1
            ? this._game.player1.dice.includes(die)
            : this._game.player2.dice.includes(die);

        if (!dieBelongsToCurrent) {
            Game.Notifier.error("Cannot select opponent's dice.");
            return;
        }

        if (!this._hasRolledThisTurn) {
            Game.Notifier.error("You must roll first!");
            return;
        }

        if (die.isLocked) {
            Game.Notifier.error("Dice kept on previous turns.");
            return;
        }

        if (this.currentPlayerRollCount === 0) {
            Game.Notifier.error("Roll at least once before keeping dice.");
            return;
        }

        if (this.currentPlayerRollCount >= RollPhase.MAX_ROLLS) {
            Game.Notifier.error("Final roll. You cannot change dice now.");
            return;
        }

        die.isKept = !die.isKept;
    }

    endPhase(): void {
        // "dry run" tokens for the favor phase
        this._game.phase = new FavorPhase(this._game);
    }

    get canRoll(): boolean {
        return !this._hasRolledThisTurn && this.currentPlayerRollCount < RollPhase.MAX_ROLLS;
    }
}