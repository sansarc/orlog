import type {IDie, IPlayer} from "../interfaces.ts";
import {RollPhase} from "./RollPhase.ts";
import {Game} from "../Game.ts" ;
import type {FavorPriority} from "../favors/IGodFavor.ts";


export class ResolutionPhase {
    readonly name = "RESOLUTION";
    private readonly _game: Game;

    constructor(game: Game) {
        this._game = game;
    }

    public resolveCombatAtIndex(index: number): void {
        const firstPlayer = this._game.firstPlayer;
        const secondPlayer = this._game.getOtherPlayer(firstPlayer);

        const die1 = firstPlayer.dice[index];
        const die2 = secondPlayer.dice[index];

        if (die1 && !die1.isResolved)
            die1.resolve(firstPlayer, secondPlayer);
        if (die2 && !die2.isResolved)
            die2.resolve(secondPlayer, firstPlayer);
    }

    resolveTokenGains(): void {
        console.log("Resolving token gains...");

        for (const player of [this._game.player1, this._game.player2]) {
            // Only count dice that have tokens and aren't resolved (though usually all are unresolved at start)
            const tokensGained = player.dice.filter(die => die.hasToken).length

            if (tokensGained > 0)
                player.addToken(tokensGained);
        }
    }

    resolvePlayerFavor(player: IPlayer, opponent: IPlayer, priority: FavorPriority, targets?: IDie[]): boolean {
        const selectedFavor = player.selectedFavor;

        if (!selectedFavor) {
            console.log(`Resolution: No favor selected for ${player.name}`);
            return false;
        }

        const favor = selectedFavor.favor;
        const cost = favor.getCost(selectedFavor.level);

        if (favor.priority !== priority)
            return false;

        if (player.tokens < cost) {
            console.warn(`Resolution: ${player.name} cannot afford ${favor.name}. Has ${player.tokens}, needs ${cost}.`);
            Game.Notifier.error(`${player.name} cannot afford ${favor.name} (Tokens: ${player.tokens}/${cost})`);
            player.selectedFavor = null;
            return false;
        }

        console.log(`Resolving ${favor.name} for ${player.name}`);
        player.removeToken(cost);
        favor.execute(player, opponent, selectedFavor.level, targets);

        player.selectedFavor = null;
        return true;
    }

    finishResolution(): void {
        if (this._game.player1.isDead() || this._game.player2.isDead()) {
            console.log("GAME OVER!")
            // In a real app, set a GameOverPhase
        } else
            this.endPhase();
    }

    endPhase() {
        this._game.player1.clearDice();
        this._game.player2.clearDice();

        this._game.firstPlayer = this._game.getOtherPlayer(this._game.firstPlayer);
        this._game.phase = new RollPhase(this._game);
    }

    static calculateToken(player1: IPlayer, player2: IPlayer): {p1Tokens: number, p2Tokens: number} {
        let p1Tokens = player1.tokens;
        let p2Tokens = player2.tokens;

        for (const die of player1.dice) {
            if (die.hasToken && !die.isResolved)
                p1Tokens++;
        }
        for (const die of player2.dice) {
            if (die.hasToken && !die.isResolved)
                p2Tokens++;
        }

        return {p1Tokens, p2Tokens};
    }
}