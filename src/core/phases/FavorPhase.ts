import type {IGamePhase} from "./IGamePhase.ts";
import {ResolutionPhase} from "./ResolutionPhase.ts";
import type {IGodFavor} from "../favors/IGodFavor.ts";
import {Game} from "../Game.ts";

export class FavorPhase implements IGamePhase {
    readonly name = "FAVOR";
    private readonly _game;

    private _p1Acted = false;
    private _p2Acted = false;

    constructor(game: Game) {
        this._game = game;
        this._game.currentPlayer = this._game.firstPlayer;

        console.log(`Favor Phase Started. First to pick: ${this._game.currentPlayer.name}`);
    }

    public handleFavorPick(favor: IGodFavor | null, level: 1 | 2 | 3): void {
       const cost = favor ? favor.getCost(level) : 0;

       if (favor && cost > this.currentBudget) {
           Game.Notifier.error(`Not enough tokens! You have ${this._game.currentPlayer.tokens}, need ${cost}.`);
           return;
       }

       this._game.currentPlayer.selectedFavor = favor ? { favor, level } : null;

        if (favor)
            console.log(`${this._game.currentPlayer.name} chose a favor.`);
        else
            console.log(`${this._game.currentPlayer.name} skipped favor.`);

        this.advanceTurn();
    }

    private advanceTurn(): void {
        if (this._game.currentPlayer === this._game.player1)
            this._p1Acted = true;
        else
            this._p2Acted = true;

        if (this._p1Acted && this._p2Acted) {
            this.endPhase();
            return;
        }

        this._game.currentPlayer = this._game.getOtherPlayer(this._game.currentPlayer);
        console.log(`${this._game.currentPlayer.name}'s turn to choose.`);
    }

    endPhase(): void {
        this._game.phase = new ResolutionPhase(this._game);
    }

    get currentBudget() : number {
        return this._game.currentPlayer.tokens;
    }
}