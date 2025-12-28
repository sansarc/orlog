import type {IDie, IPlayer} from "../interfaces.ts";
import {RollPhase} from "./RollPhase.ts";
import {Game} from "../Game.ts" ;
import type {FavorPriority} from "../favors/IGodFavor.ts";
import type {IGamePhase} from "./IGamePhase.ts";


export class ResolutionPhase implements IGamePhase {
    readonly name = "RESOLUTION";
    private readonly _game: Game;

    constructor(game: Game) {
        this._game = game;
    }

    resolveDiceCombat() {
        const p1Count = this._game.player1.dice.length;
        const p2Count = this._game.player2.dice.length;

        const maxDice = Math.max(p1Count, p2Count, 6);

        for (let i = 0; i < maxDice; i++)
            this.resolveCombatAtIndex(i);
    }

    public resolveCombatAtIndex(index: number): void {
        const p1 = this._game.firstPlayer;
        const p2 = this._game.getOtherPlayer(p1);

        const die1 = p1.dice[index];
        const die2 = p2.dice[index];

        // standard fight die vs die
        if (die1 && die2) {
            if (!die1.isResolved) die1.resolve(p1, p2);
            if (!die2.isResolved) die2.resolve(p2, p1);
        }
        // P1 has an extra die, P2 has nothing: direct hit
        else if (die1 && !die2) {
            if (!die1.isResolved) die1.resolve(p1, p2);
        }
        // P2 has an extra die, P1 nothing
        else if (!die1 && die2) {
            if (!die2.isResolved) die2.resolve(p2, p1);
        }
    }

    resolveTokenGains(): void {
        for (const player of [this._game.player1, this._game.player2]) {
            // Only count dice that have tokens and aren't resolved (though usually all are unresolved at start)
            const tokensGained = player.dice.filter(die => die.hasToken).length

            if (tokensGained > 0)
                player.addToken(tokensGained);
        }
    }

    resolvePlayerFavor(player: IPlayer, opponent: IPlayer, priority: FavorPriority, target?: IDie[] | number): boolean {
        const selectedFavor = player.selectedFavor;

        if (!selectedFavor) return false;

        const favor = selectedFavor.favor;
        const cost = favor.getCost(selectedFavor.level);

        if (favor.priority !== priority)
            return false;

        if (player.tokens < cost) {
            player.selectedFavor = null;
            return false;
        }

        console.log(`Resolving ${favor.name} for ${player.name}`);
        player.removeToken(cost);
        favor.execute(player, opponent, selectedFavor.level, target);

        player.selectedFavor = null;
        return true;
    }

    endPhase(): void {
        console.log("Resolution Phase Complete. Cleaning up...");

        // 1. Clear Dice / Temporary stats
        this._game.player1.clearDice();
        this._game.player2.clearDice();

        // 2. Swap Priority (First player rotates every round)
        this._game.swapFirstPlayer();

        // 3. Increment Round Counter <--- NEW
        this._game.nextRound();

        // 4. Start New Round
        this._game.phase = new RollPhase(this._game);
    }
}