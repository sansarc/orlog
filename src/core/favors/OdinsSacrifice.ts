import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class OdinsSacrifice implements IGodFavor {
    readonly name = "Odin's Sacrifice";
    readonly totemImgPath = '/icons/odins-sacrifice.png';
    readonly priority = 'POST_COMBAT';
    readonly targetType = 'SELF_HEALTH';

    getCost(level: number): number {
        switch (level) {
            case 1: return 6;
            case 2: return 8;
            case 3: return 10;
            default:
                throw new Error("Invalid level.");
        }
    }

    getTokenMultiplier(level: number): number {
        return level + 2;
    }

    getDescription(level: number): string {
        if (level === 0) return 'After the Resolution phase, sacrifice any number of your health tokens. Gain ⌘ per health token sacrificed.';
        return `Gain ${this.getTokenMultiplier(level)}⌘ per HP`;
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number, sacrifice: number) {
        if (sacrifice <= 0) {
            Game.Notifier.info("No health sacrificed, Odin can't deal tokens.");
            return;
        }

        owner.damage(sacrifice);
        const tokenToGain = sacrifice * this.getTokenMultiplier(level);
        owner.addToken(tokenToGain);

        Game.Notifier.info(`${owner.name} sacrificed ${sacrifice} Health. Odin grants ${tokenToGain}⌘.`);
    }
}