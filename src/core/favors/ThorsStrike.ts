import type {Player} from "../Player.ts";
import type { IGodFavor } from "./IGodFavor.ts";
import {Game} from "../Game.ts";


/**
 * Thor's Strike is a God Favor that deals direct damage to the opponent.
 */
export class ThorsStrike implements IGodFavor {
    readonly name = "Thor's Strike";
    readonly totemImgPath = "/icons/thors-strike.png";
    readonly priority = 'POST_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 8;
            case 3: return 12;
        }

        return 0; // should never happen
    }

    getDescription(level: number): string {
        if (level === 0) return 'Deal damage to the opponent after the Resolution phase.'
        return `Deal ${this.getDamage(level)} damage`;
    }

    private getDamage(level: number): number {
        if (level === 1) return 2;
        else if (level === 2) return 5;
        else return 8;
    }

    execute(_owner: Player, opponent: Player, level: number): void {
        const damage = this.getDamage(level);
        Game.Notifier.info(`Thor strikes for ${damage} damage!`);
        opponent.damage(damage);
    }
}