import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeimdallsWatch } from '../HeimdallsWatch.ts';
import {createMockDie} from "../../../utils/testUtils.ts";

// 1. Mock the Game Notifier to prevent errors during test
vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn() // Do nothing when called
        }
    }
}));

describe("Heimdall's Watch", () => {
    let favor: HeimdallsWatch;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new HeimdallsWatch();

        // Mock Player
        owner = {
            name: "P1",
            dice: [],
            health: 10,
            // Mock heal to track calls and update local health
            heal: vi.fn((amount: number) => {
                owner.health += amount;
            })
        };

        opponent = { name: "P2" };
    });

    it('identifies as POST_COMBAT', () => {
        expect(favor.priority).toBe('POST_COMBAT');
    });

    it('Level 1: Heals 1 HP per blocked attack', () => {
        // SETUP:
        // 2 Helmets were used (Resolved) -> 2 Blocks
        // 1 Shield was NOT used (Unresolved) -> 0 Blocks
        // 1 Axe was used (Resolved) -> Irrelevant
        owner.dice = [
            createMockDie('HELMET', true),
            createMockDie('HELMET', true),
            createMockDie('SHIELD', false),
            createMockDie('AXE', true)
        ];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        // 2 Blocks * 1 HP = 2 Total
        expect(owner.heal).toHaveBeenCalledWith(2);
        expect(owner.health).toBe(12); // 10 + 2
    });

    it('Level 2: Heals 2 HP per blocked attack', () => {
        // SETUP: 3 Shields blocked Arrows
        owner.dice = [
            createMockDie('SHIELD', true),
            createMockDie('SHIELD', true),
            createMockDie('SHIELD', true)
        ];

        // ACT
        favor.execute(owner, opponent, 2);

        // ASSERT
        // 3 Blocks * 2 HP = 6 Total
        expect(owner.heal).toHaveBeenCalledWith(6);
        expect(owner.health).toBe(16);
    });

    it('Level 3: Heals 3 HP per blocked attack', () => {
        // SETUP: 1 Helmet blocked an Axe
        owner.dice = [createMockDie('HELMET', true)];

        // ACT
        favor.execute(owner, opponent, 3);

        // ASSERT
        // 1 Block * 3 HP = 3 Total
        expect(owner.heal).toHaveBeenCalledWith(3);
    });

    it('Heals 0 if no defense was successful', () => {
        // SETUP: Player rolled defenses but opponent didn't attack
        // So defenses are NOT resolved
        owner.dice = [
            createMockDie('HELMET', false),
            createMockDie('SHIELD', false)
        ];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(owner.heal).toHaveBeenCalledWith(0);
    });
});