import type {IGodFavor} from "./IGodFavor.ts";
import type {Player} from "../Player.ts";
import {Game} from "../Game.ts";

export class IdunnsRejuvenation implements IGodFavor {
    readonly name = "Iðunn's Rejuvenation";
    readonly totemImgPath = "/icons/idunns-rejuvenation.png";
    readonly priority = 'PRE_COMBAT';

    getCost(level: number): number {
        switch (level) {
            case 1: return 4;
            case 2: return 7;
            case 3: return 10;
        }

        return 0;
    }

    getDescription(level: number): string {
        if (level === 0) return 'Heal Health after Resolution phase.'
        return `Heal ${this.getHealAmount(level)} health`;
    }

    execute(owner: Player, _opponent: Player, level: number): void {
        const healAmount = this.getHealAmount(level);

        Game.Notifier.info(`Iðunn heals ${healAmount} health!`);
        owner.heal(healAmount);
    }

    private getHealAmount(level: number) {
        if (level === 1) return 2;
        else if (level === 2) return 4;
        else return 6;
    }
}