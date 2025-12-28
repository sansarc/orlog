import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class BrunhildsFury implements IGodFavor {
    readonly name = "Brunhild's Fury";
    readonly totemImgPath = "/icons/brunhilds-fury.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 6;
            case 2: return 10;
            case 3: return 18;
            default:
                throw new Error("Invalid level.");
        }
    }

    getMultiplier(level: number): number {
        switch (level) {
            case 1: return 1.5;
            case 2: return 2;
            case 3: return 3;
            default:
                throw new Error("Invalid level.");
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Multiply AXES rounded up.'
        else return `AXES x${this.getMultiplier(level)}`;
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number): void {
        const multiplier = this.getMultiplier(level);

        owner.dice
            .filter(die => die.face === 'AXE' && !die.isResolved)
            .forEach(axe => axe.damage = Math.ceil(axe.damage * multiplier));

        Game.Notifier.info(`Brunhild multiplies AXES damage by ${multiplier}!`);
    }
}