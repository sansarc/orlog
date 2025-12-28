import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class TyrsPledge implements IGodFavor {
    readonly name = "Tyr's Pledge";
    readonly totemImgPath = "/icons/tyrs-pledge.png";
    readonly priority = 'PRE_COMBAT';
    readonly targetType = 'SELF_HEALTH';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 6;
            case 3: return 8;
            default:
                throw new Error("Invalid level.");
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Sacrifice any number of your Health tokens. Destroy opponent\'s ⌘ per Health sacrificed.';
        return `-${level + 1}HP per ⌘.`;
    }

    execute(owner: IPlayer, opponent: IPlayer, level: number, sacrifice: number = 0) {
        if (sacrifice <= 0) {
            Game.Notifier.info("No health sacrificed, Tyr can't destroy " + opponent.name + "'s ⌘.");
            return;
        }

        owner.damage(sacrifice);
        const toDestroy = sacrifice * (level + 1);
        opponent.removeToken(toDestroy);

        Game.Notifier.info(`${owner.name} sacrificed ${sacrifice} Health. Tyr destroys ${toDestroy} of ${opponent.name}'s ⌘.`);
    }
}