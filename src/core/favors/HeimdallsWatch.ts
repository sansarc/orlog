import type {Player} from "../Player.ts";
import {Game} from "../Game.ts";
import type {IGodFavor} from "./IGodFavor.ts";

export class HeimdallsWatch implements IGodFavor {
    readonly name = "Heimdall's Watch";
    readonly totemImgPath = "/icons/heimdalls-watch.png";
    readonly priority = 'POST_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 7;
            case 3: return 10;
        }

        return 0;
    }

    getHealAmountPerBlock(level: number): number {
        if (level === 1) return 1;
        else if (level === 2) return 2;
        else return 3;
    }

    getDescription(level: number): string {
        if (level === 0) return 'Heal Health for each attack you block.'
        return `+${this.getHealAmountPerBlock(level)} Health per block`;
    }

    execute(owner: Player, _opponent: Player, level: number): void {
        const blocks = owner.dice.filter(die =>
            (die.face === 'HELMET' || die.face === 'SHIELD') &&
                die.isResolved
        ).length

        const healAmount = blocks * this.getHealAmountPerBlock(level);
        Game.Notifier.info(`Heimdall heals ${healAmount} health for blocking ${blocks} attacks!`);
        owner.heal(healAmount);
    }
}