import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class HelsGrip implements IGodFavor {
    readonly name = "Hel's Grip";
    readonly totemImgPath = "/icons/hels-grip.png"
    readonly priority = 'POST_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 6;
            case 2: return 12;
            case 3: return 18;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Each AXE damage dealt to opponent heals you.';
        return `+${level}HP per damage`;
    }

    execute(owner: IPlayer, _opponent: IPlayer, level: number) {
        const axes = owner.dice.filter(die => die.face === 'AXE' && die.isResolved && die.hitType === 'PLAYER').length;
        owner.heal(axes * level);

        Game.Notifier.info(`Hel's Grip heals for ${axes * level} HP!`);
    }
}