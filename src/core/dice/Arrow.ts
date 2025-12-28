import type {DieAction} from "./DieAction.ts";
import type {Player} from "../Player.ts";
import type {Die} from "../Die.ts";

export class Arrow implements DieAction {
    resolve(_owner: Player, opponent: Player, die: Die) {
        let damageToDeal = die.damage;

        while (damageToDeal > 0) {
            const targetShield = opponent.getUnresolvedShield();

            if (targetShield)
                targetShield.takeHit();
            else
                opponent.damage();

            damageToDeal--;

            console.log(`ARROW die deals 1 damage to ${targetShield ? 'SHIELD' : 'opponent'} (health left: ${targetShield ? targetShield.defenseHealth : opponent.health}).`);
        }

        die.isResolved = true;
    }
}