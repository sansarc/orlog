import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class VarsBond implements IGodFavor {
    readonly name = "Vár's Bond";
    readonly totemImgPath = "/icons/vars-bond.png"
    readonly priority = 'POST_COMBAT'

    getCost(level: number): number {
        switch (level) {
            case 1: return 10;
            case 2: return 14;
            case 3: return 18;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Each ⌘ spent by your opponent heals you.';
        return `+${level}HP per ⌘`;
    }

    execute(owner: IPlayer, opponent: IPlayer, level: number) {
        if (!opponent.selectedFavor) {
            Game.Notifier.info(`${opponent.name} selected no favor. Vár can't heal.`);
            return;
        }

        const opponentFavorLevel = opponent.selectedFavor.level;
        owner.heal(opponent.selectedFavor.favor.getCost(opponentFavorLevel * level))

        Game.Notifier.info(`Vár heals ${opponentFavorLevel * level}`);
    }
}