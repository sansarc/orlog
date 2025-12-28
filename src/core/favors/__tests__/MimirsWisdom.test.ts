import { describe, it, expect, beforeEach, vi } from 'vitest';
import {MimirsWisdom} from "../MimirsWisdom.ts";
import {Player} from "../../Player.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn() // Do nothing when called
        }
    }
}));

describe("Mimir's Wisdom Integration", () => {
    let favor: MimirsWisdom;
    let owner: Player;
    let opponent: Player;

    beforeEach(() => {
        favor = new MimirsWisdom();
        owner = new Player("Owner");
        opponent = new Player("Opponent");
    });

    it('Player tracks damage accurately', () => {
        // 1. Initial State
        expect(owner.damageTakenThisRound).toBe(0);

        // 2. Take Damage
        owner.damage(3);
        expect(owner.damageTakenThisRound).toBe(3);
        expect(owner.health).toBe(12); // Default is 15 - 3

        // 3. Take More Damage (Accumulation)
        owner.damage(2);
        expect(owner.damageTakenThisRound).toBe(5); // 3 + 2
        expect(owner.health).toBe(10);
    });

    it('Player resets damage tracker on clearDice()', () => {
        owner.damage(5);
        expect(owner.damageTakenThisRound).toBe(5);

        // End of round cleanup
        owner.clearDice();

        expect(owner.damageTakenThisRound).toBe(0);
    });

    it('Level 1: Gains 1 Token per 1 Damage', () => {
        // Setup: Player took 4 damage this round
        opponent.damage(4);

        // Execute Favor
        favor.execute(owner, opponent, 1);

        // Assert: 4 dmg * 1 = 4 tokens
        expect(owner.tokens).toBe(4);
    });

    it('Level 2: Gains 2 Tokens per 1 Damage', () => {
        // Setup: Player took 3 damage this round
        opponent.damage(3);

        // Execute Favor
        favor.execute(owner, opponent, 2);

        // Assert: 3 dmg * 2 = 6 tokens
        expect(owner.tokens).toBe(6);
    });

    it('Level 3: Gains 3 Tokens per 1 Damage', () => {
        // Setup: Player got hammered for 5 damage
        opponent.damage(5);

        // Execute Favor
        favor.execute(owner, opponent, 3);

        // Assert: 5 dmg * 3 = 15 tokens
        expect(owner.tokens).toBe(15);
    });

    it('Gains nothing if no damage was taken', () => {
        // Setup: Clean round
        expect(owner.damageTakenThisRound).toBe(0);

        favor.execute(owner, opponent, 1);

        expect(owner.tokens).toBe(0);
    });

    it('Tracks damage even if it exceeds health (Overkill)', () => {
        // Setup: Player has 2 HP left
        // Hack: set health manually if needed, or just damage down
        opponent.damage(13); // HP = 2
        owner.clearDice(); // Reset tracker for the test scenario
        opponent.clearDice();

        // Action: Hit for 10 damage (Overkill by 8)
        opponent.damage(10);

        expect(opponent.health).toBe(0); // Health capped at 0
        expect(opponent.damageTakenThisRound).toBe(10); // But Mimir saw all 10 damage!

        favor.execute(owner, opponent, 1);
        expect(owner.tokens).toBe(10); // Reward for the massive hit
    });
});