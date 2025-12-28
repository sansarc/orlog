import type {DieAction} from "./DieAction.ts";
import type {Player} from "../Player.ts";
import type {Die} from "../Die.ts";

export class Hand implements DieAction {
    resolve(owner: Player, opponent: Player, die: Die) {
        if (opponent.tokens <= 0) {
            die.isResolved = true;
            return;
        }

        let tokensToSteal = die.damage;

        while (tokensToSteal > 0) {
            if (opponent.tokens > 0) {
                console.log(`HAND die activated: ${owner.name} steals a token from ${opponent.name}`);
                opponent.removeToken();
                owner.addToken();
            } else {
                console.log(`HAND die deactivated: ${opponent.name} has no tokens left to steal.`);
                die.damage = 0;
                break;
            }

            tokensToSteal--;
        }

        die.isResolved = true;
    }
}