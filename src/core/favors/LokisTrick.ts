import type {IGodFavor} from "./IGodFavor.ts";
import type {IDie, IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class LokisTrick implements IGodFavor {
    readonly name = "Loki's Trick";
    readonly totemImgPath = "/icons/lokis-trick.png";
    readonly priority = 'PRE_COMBAT';
    readonly targetType = 'OPPONENT_DICE'

    getCost(level: number): number {
        switch (level) {
            case 1: return 3;
            case 2: return 6;
            case 3: return 9;
            default:
                throw new Error("Invalid level.");
        }
    }

    getSelectionLimit(level: number): number {
        return level;
    }

    getDescription(level: number): string {
        if (level === 0) return 'Ban opponent\'s dice for the round.';
        return `Ban ${level} dice`
    }

    execute(_owner: IPlayer, opponent: IPlayer, _level: number, targets?: IDie[]) {
        targets?.forEach(die => die.isResolved = true) // banning the dice

        Game.Notifier.info(`Loki bans ${targets?.length} ${opponent.name}'s dice.`);
    }
}