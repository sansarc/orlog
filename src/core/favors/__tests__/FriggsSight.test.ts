import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createMockDie} from "../../../utils/testUtils.ts";
import {DieFace} from "../../dice/DieFace.ts";
import {FriggsSight} from "../FriggsSight.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn() // Do nothing when called
        }
    }
}));

describe("Frigg's Sight", () => {
    let favor: FriggsSight;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new FriggsSight();

        // Mock Players with empty dice arrays initially
        owner = { name: "P1", dice: [] };
        opponent = { name: "P2", dice: [] };
    });

    it('Has correct configuration', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
        expect(favor.targetType).toBe('ANY_DICE');
    });

    it('Level 1 allows selecting up to 2 dice', () => {
        // Frigg: Level + 1
        expect(favor.getSelectionLimit(1)).toBe(2);
        expect(favor.getSelectionLimit(2)).toBe(3);
        expect(favor.getSelectionLimit(3)).toBe(4);
    });

    it('Executes reroll ONLY on selected dice', () => {
        // SETUP: Opponent has 3 Axes
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.AXE);
        const d3 = createMockDie(DieFace.AXE);
        opponent.dice = [d1, d2, d3];

        // ACTION: Player selects d1 and d3 to reroll (skip d2)
        const selection = [d1, d3];
        favor.execute(owner, opponent, 1, selection);

        // ASSERT
        // 1. Check if roll() was called on the right dice
        expect(d1.roll).toHaveBeenCalled();
        expect(d3.roll).toHaveBeenCalled();

        // 2. Check if d2 was left alone
        expect(d2.roll).not.toHaveBeenCalled();
    });

    it('Resets isResolved status on rerolled dice', () => {
        // Scenario: A die was somehow marked resolved (maybe from a previous effect),
        // Frigg should likely make it fresh again for the combat phase?
        // Or simply ensure it's ready for combat.

        const d1 = createMockDie(DieFace.AXE);
        d1.isResolved = true; // Mark as "used"

        favor.execute(owner, opponent, 1, [d1]);

        expect(d1.roll).toHaveBeenCalled();
        expect(d1.isResolved).toBe(false); // Should be reset to false
    });

    it('Handles empty selection gracefully', () => {
        const d1 = createMockDie(DieFace.AXE);
        opponent.dice = [d1];

        // User cancelled or selected nothing
        favor.execute(owner, opponent, 1, []);

        expect(d1.roll).not.toHaveBeenCalled();
    });
});