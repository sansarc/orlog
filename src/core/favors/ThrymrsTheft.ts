import type {IGodFavor} from "./IGodFavor.ts";
import type {IPlayer} from "../interfaces.ts";
import {Game} from "../Game.ts";

export class ThrymrsTheft implements IGodFavor {
    readonly name = 'Thrymr\'s Theft';
    readonly totemImgPath = '/icons/thrymrs-theft.png'
    readonly priority = 'IMMEDIATE';

    getCost(level: number): number {
        switch (level) {
            case 1: return 3;
            case 2: return 6;
            case 3: return 9;
            default: throw new Error("Invalid level: " + level);
        }
    }

    getDescription(level: number): string {
        if (level === 0) return 'Reduce the effect of a God Favor invoked by the opponent this round.';
        return `-${level} ${level === 1 ? 'level' : 'levels'}`;
    }

    execute(owner: IPlayer, opponent: IPlayer, level: number) {

        // I don't know how does it work in the original game, but here you can see if a player selected this favor first,
        // then it'd be easy to avoid the downgrade by not selecting any favor.
        if (!opponent.selectedFavor) {
            const cost = this.getCost(level);
            Game.Notifier.info(`${opponent.name} selected no favor. Thrymr refunds ${cost}⌘ to ${owner.name}.`);
            owner.addToken(cost);
            return;
        }

        opponent.selectedFavor.level -= level;

        if (opponent.selectedFavor.level < 1) {
            Game.Notifier.info(`Thrymr downgrades ${opponent.name}'s ${opponent.selectedFavor.favor.name}, removing it entirely.`);
            opponent.selectedFavor = null;
        }
        else
            Game.Notifier.info(`Thrymr downgrades ${opponent.name}'s ${opponent.selectedFavor.favor.name} to level ${opponent.selectedFavor.level}.`);
    }
}