import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class SkuldsClaim implements IGodFavor {
    readonly name: string = "Skuld's Claim";
    readonly totemImgPath: string = "/icons/skulds-claim.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 6;
            case 3: return 8;
            default:
                throw new Error("Invalid level: " + level);
        }
    }

    getTokensToRemove(level: number): number {
        return level + 1;
    }

    getDescription(level: number): string {
        if (level === 0) return "Destroy opponent's ⌘ for each die that rolled ARROW." ;
        return '-' + this.getTokensToRemove(level) + '⌘ per ARROW.';
    }

    execute(owner: IPlayer, opponent: IPlayer, level: number) {
        const tokensToRemove = this.getTokensToRemove(level);

        const arrows = owner.dice.filter(die => die.face === 'ARROW' && !die.isResolved).length;
        opponent.removeToken(arrows * tokensToRemove);

        Game.Notifier.info("Skuld destroys " + tokensToRemove + "⌘");
    }

}