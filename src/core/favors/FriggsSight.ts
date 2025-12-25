import type {IGodFavor} from "./IGodFavor.ts";
import type {IDie, IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class FriggsSight implements IGodFavor {
    readonly name = "Frigg's Sight";
    readonly totemImgPath = "/icons/friggs-sight.png";
    readonly priority = 'PRE_COMBAT';
    readonly targetType = 'ANY_DICE';

    getCost(level: number): number {
        switch (level) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 4;
            default:
                throw new Error("Invalid level.");
        }
    }

    getSelectionLimit(level: number): number {
        return level + 1;
    }

    getDescription(level: number): string {
        if (level === 0) return 'Reroll any of your or your opponent\'s dice.'
        else return `Reroll ` + this.getSelectionLimit(level) + ' dice.';
    }

    execute(_owner: IPlayer, _opponent: IPlayer, _level: number, selection: IDie[] = []): void {
        selection.forEach((die, index) => {
            console.log(`Rerolling die ${index}: ${die.face} (Resolved: ${die.isResolved})`);

            die.roll();
            die.isResolved = false;
        });

        Game.Notifier.info(`Frigg rerolls ${selection.length} dice.`);
    }
}