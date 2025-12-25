import { Player } from "./Player.ts";
import type { Die } from "./Die.ts";
import type { IGodFavor } from "./favors/IGodFavor.ts";
import type {IGamePhase} from "./phases/IGamePhase.ts";
import {RollPhase} from "./phases/RollPhase.ts";
import type {INotifier} from "./INotifier.ts";
import type { IPlayer } from "./interfaces.ts";


export class Game {
    readonly player1 = new Player("Player 1");
    readonly player2 = new Player("Player 2");

    private _currentPlayer: Player;
    private _firstPlayer: Player;
    private _phase: IGamePhase;

    static readonly Notifier: INotifier;

    constructor() {
        this._firstPlayer = Math.random() < 0.5 ? this.player1 : this.player2;
        this._currentPlayer = this._firstPlayer;
        this._phase = new RollPhase(this);

        this.player1.addToken(10);
    }

    // ----- USER ACTIONS -----

    onRollClicked(): void {
        this._phase.handleRollClick?.();
    }

    onDieClicked(die: Die): void {
        this._phase.handleDieClick?.(die);
    }

    onFavorClicked(favor: IGodFavor | null, level: 1 | 2 | 3 = 1): void {
        this._phase.handleFavorPick?.(favor, level);
    }

    onConfirmClicked(): void {
        this._phase.handleConfirmClick?.();
    }

    // ----- HELPERS -----

    getOtherPlayer(p: IPlayer): IPlayer {
        return p === this.player1 ? this.player2 : this.player1;
    }

    // ----- GETTERS/SETTERS -----

    get currentPlayer(): IPlayer {
        return this._currentPlayer;
    }

    set currentPlayer(value: IPlayer) {
        this._currentPlayer = value as Player;
    }

    get firstPlayer(): IPlayer {
        return this._firstPlayer;
    }

    set firstPlayer(value: IPlayer) {
        this._firstPlayer = value as Player;
    }

    get phase(): IGamePhase {
        return this._phase;
    }

    set phase(value: IGamePhase) {
        this._phase = value;
    }
}

