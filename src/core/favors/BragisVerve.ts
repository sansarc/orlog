import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class BragisVerve implements IGodFavor {
    readonly name = "Bragi's Verve";
    readonly totemImgPath = '/icons/bragis-verve.png';
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 8;
            case 3: return 12;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Gain ⌘ for each die that rolled HAND.'
        return `Gain ${level + 1}⌘ per die`;
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number) {
        const hands = owner.dice.filter(die => die.face === 'HAND' && !die.isResolved).length
        owner.addToken(hands * (level + 1));

        Game.Notifier.info(`Bragi adds ${level + 1} tokens from hands.`)
    }
}