import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class SkadisHunt implements IGodFavor {
    readonly name: string = "Skaði's Hunt";
    readonly totemImgPath: string = "/icons/skadis-hunt.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 6;
            case 2: return 10;
            case 3: return 14;
            default:
                throw new Error("Invalid level: " + level);
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Add ARROWS to each die that rolled ARROW.';
        return `+${level} ARROWS per die`;
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number) {
        owner.dice.filter(die => die.face === 'ARROW' && !die.isResolved)
            .forEach(arrow => arrow.damage += level);

        Game.Notifier.info("Skaði adds +" + level + " to each ARROW!");
    }

}