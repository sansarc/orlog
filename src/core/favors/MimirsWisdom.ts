import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class MimirsWisdom implements IGodFavor {
    readonly name = "Mímir's Wisdom"
    readonly totemImgPath = "/icons/mimirs-wisdom.png"
    readonly priority = 'POST_COMBAT'

    getCost(level: number): number {
        switch (level) {
            case 1: return 3;
            case 2: return 5;
            case 3: return 7;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Gain ⌘ for each damage dealt to you this round.';
        return `+${level}⌘ per damage`;
    }

    execute(owner: IPlayer, opponent: IPlayer, level: number) {
        const damageTaken = opponent.damageTakenThisRound;

        if (damageTaken === 0) {
            Game.Notifier.info("Mímir can't heal, no damage dealt.");
            return;
        }

        const tokensToGain = damageTaken * level;
        owner.addToken(tokensToGain);
        Game.Notifier.info(`${owner.name} deals ${damageTaken} damage, Mímir adds ${tokensToGain} tokens.`);
    }
}