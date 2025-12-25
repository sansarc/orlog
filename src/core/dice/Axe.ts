import type {DieAction} from "./DieAction.ts";
import type {Player} from "../Player.ts";
import type {Die} from "../Die.ts";

export class Axe implements DieAction {
    resolve(_owner: Player, opponent: Player, die: Die) {
       let damageToDeal = die.damage;

       while (damageToDeal > 0) {
           const targetHelmet = opponent.getUnresolvedHelmets();

           if (targetHelmet) {
               targetHelmet.takeHit();
               if (damageToDeal === 0) // last damage dealt
                   die.hitType = 'DEFENSE';
           }
           else {
               opponent.damage();
               if (damageToDeal === 0) // last damage dealt
                   die.hitType = 'PLAYER';
           }

           damageToDeal--;

           console.log(`Axe die deals 1 damage to ${targetHelmet ? 'Helmet' : 'opponent'} (health left: ${targetHelmet ? targetHelmet.defenseHealth : opponent.health}).`);
       }

       die.isResolved = true;
    }
}