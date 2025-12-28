import { describe, it, expect } from 'vitest';
import {Die} from "../Die.ts";

describe('Die Mechanics', () => {
    it('Resets buffs when cleared', () => {
        const die = new Die();

        // Apply buffs
        die.damage = 3;
        die.addDefense(2);

        expect(die.damage).toBe(3);
        expect(die.defenseHealth).toBe(3); // 1 base + 2 buff

        // End of round
        die.clear();

        // Assert defaults restored
        expect(die.damage).toBe(1);
        expect(die.defenseHealth).toBe(1);
    });

    it('Takes multiple hits if durability > 1', () => {
        const die = new Die();
        die.addDefense(1); // Total 2 HP

        // First hit
        const aliveAfterHit1 = die.takeHit();
        expect(aliveAfterHit1).toBe(true);
        expect(die.isResolved).toBe(false);

        // Second hit
        const aliveAfterHit2 = die.takeHit();
        expect(aliveAfterHit2).toBe(false); // Breaks now
        expect(die.isResolved).toBe(true);
    });
});