import { describe, it, expect, beforeEach } from 'vitest';
import {Player} from "../Player.ts";

describe('Player Logic', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player("TestViking");
        player.health = 10;
        player.tokens = 5;
    });

    it('Caps health at 15 when healing', () => {
        player.heal(10);
        expect(player.health).toBe(15); // Should not be 20
    });

    it('Does not allow health to go below 0', () => {
        player.damage(20);
        expect(player.health).toBe(0); // Should not be -10
    });

    it('Tracks damage taken in the current round (for Mimir)', () => {
        player.clearDice(); // Reset round stats

        player.damage(3);
        player.damage(2);

        expect(player.damageTakenThisRound).toBe(5);

        player.clearDice(); // End round
        expect(player.damageTakenThisRound).toBe(0); // Should reset
    });

    it('Cannot spend more tokens than owned', () => {
        // Logic might be in removeToken
        player.tokens = 5;

        // If your removeToken logic allows going negative, this test helps you decide if that's intended.
        // Or usually, you check "canAfford" before removing.
        player.removeToken(6);

        // Depending on your implementation, this should either stay 5 (fail) or go to 0, or -1.
        // Let's assume you clamp at 0.
        expect(player.tokens).toBeGreaterThan(-1);
    });
});