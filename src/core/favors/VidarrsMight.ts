import type {IGodFavor} from "./IGodFavor.ts";
import type {Player} from "../Player.ts";
import {DieFace} from "../dice/DieFace.ts";
import {Game} from "../Game.ts";

export class VidarrsMight implements IGodFavor {
    readonly name = "Víðarr's Might";
    readonly totemImgPath = "/icons/vidarrs-might.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 2;
            case 2: return 4;
            case 3: return 6;
        }

        return 0; // should never happen
    }

    getDescription(level: number): string {
        if (level === 0) return 'Remove HELMETS from the opponent.'
        return `-${level * 2} HELMETS`;
    }

    execute(_owner: Player, opponent: Player, level: number) {
        const toRemove = level * 2;
        const helmets = opponent.dice.filter(die => die.face === DieFace.HELMET && !die.isResolved);

        for (let i = 0; i < toRemove && i < helmets.length; i++) {
            const helmet = helmets[i];
            if (helmet)
                helmet.takeHit();
        }

        Game.Notifier.info(`Víðarr removes ${Math.min(toRemove, helmets.length)} helmets!`);
    }
}