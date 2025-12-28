import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Die} from "../Die.ts";
import {Game} from "../Game.ts";

export class FreyjasPlenty implements IGodFavor {
    readonly name = "Freyja's Plenty";
    readonly totemImgPath = '/icons/freyjas-plenty.png';
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 2;
            case 2: return 4;
            case 3: return 6;
            default:
                throw new Error("Invalid level.");
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Roll additional dice this round.';
        return `+${level} ${level === 1 ? 'die' : 'dice'}`;
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number) {
        for (let i = 0; i < level; i++) {
            const die = new Die(true);
            die.roll();
            owner.dice.push(die)
        }

        Game.Notifier.info(`Freyja adds ${level} dice this to ${owner.name}.`);
    }
}