import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";
import type {DieFace} from "../dice/DieFace.ts";

export class FreyrsGift implements IGodFavor {
    readonly name = "Freyr's Gift";
    readonly  totemImgPath = "/icons/freyrs-gift.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 6;
            case 3: return 8;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getDieToAdd(level: number): number {
        if (level === 1) return 2;
        else if (level === 2) return 3;
        else return 4;
    }

    getDescription(level: number): string {
        if (level === 0) return 'Add to the total of whichever die face is in majority.'
        return 'Add ' + this.getDieToAdd(level) + ' to the total of whichever die face is in majority.';
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number) {
        const toAdd = this.getDieToAdd(level);

        const faceCounts: Record<DieFace, number> = {
            'HAND': 0,
            'ARROW': 0,
            'HELMET': 0,
            'SHIELD': 0,
            'AXE': 0
        };

        for (const die of owner.dice) {
            if (!die.isResolved)
                faceCounts[die.face] = (faceCounts[die.face] || 0) + 1;
        }

        // 5 faces for 6 dice, so there will always be a majority, no need for | null
        let majorityFace = 'AXE' as DieFace; // the one with more probability to have the highest count anyway
        let maxCount = 0;

        for (const face in faceCounts) {
            if (faceCounts[face as DieFace] > maxCount) {
                maxCount = faceCounts[face as DieFace];
                majorityFace = face as DieFace;
            }
        }

        const highestCountDice = owner.dice.filter(die => die.face === majorityFace && !die.isResolved);

        if (majorityFace === 'HELMET' || majorityFace === 'SHIELD')
            highestCountDice.forEach(defenceDie => defenceDie.addDefense(toAdd))
        else
            highestCountDice.forEach(attackDie => attackDie.damage += toAdd);

        Game.Notifier.info(`Freyr adds +${toAdd} to each ${majorityFace} die!`);
    }

}