import type {Player} from "../Player.ts";
import type {Die} from "../Die.ts";

export interface DieAction {
    /**
     * Resolves the effect of this die face.
     * @param owner The player who rolled this die.
     * @param opponent The player this die is affecting.
     * @param die The die itself (from dice in Player.ts), so that can be marked as resolved for "attacking" dice.
     */
    resolve(owner: Player, opponent: Player, die: Die): void;
}