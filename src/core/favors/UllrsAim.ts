import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class UllrsAim implements IGodFavor {
    readonly name = "Ullr's Aim";
    readonly totemImgPath = "/icons/ullrs-aim.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 4;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getShieldsToRemove(level: number): number {
        if (level === 1) return 2;
        else if (level === 2) return 3;
        else return 6;
    }

    getDescription(level: number): string {
        if (level === 0) return 'Your ARROWS ignore the opponent\'s SHIELDS.';
        return `${this.getShieldsToRemove(level)} ARROWS ignore SHIELDS.`;
    }

    execute(_owner: IPlayer, opponent: IPlayer, level: number) {
        const toRemove = this.getShieldsToRemove(level);
        const shields = opponent.dice.filter(die => die.face === 'SHIELD' && !die.isResolved);

        for (let i = 0; i < toRemove && i < shields.length; i++) {
            const shield = shields[i];
            if (shield)
                shield.takeHit();
        }

        Game.Notifier.info("Ullr makes " + toRemove + " arrows ignore shields!")
    }
}