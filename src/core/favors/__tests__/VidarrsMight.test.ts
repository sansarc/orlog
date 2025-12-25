import {describe, it, expect, beforeEach, vi} from 'vitest';
import {DieFace} from "../../dice/DieFace.ts";
import {VidarrsMight} from "../VidarrsMight.ts";
import {createMockDie} from "../../../utils/testUtils.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe("Vidar's Might", () => {
    let favor: VidarrsMight;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new VidarrsMight();
        owner = { name: "P1", tokens: 50 };
        opponent = { name: "P2", dice: [] };
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('Level 1: Removes up to 2 Helmets', () => {
        // SETUP: Opponent has 3 Helmets and 1 Axe
        const d1 = createMockDie(DieFace.HELMET);
        const d2 = createMockDie(DieFace.HELMET);
        const d3 = createMockDie(DieFace.HELMET);
        const d4 = createMockDie(DieFace.AXE);

        opponent.dice = [d1, d2, d3, d4];

        // ACT: Execute Level 1 (Should remove 2)
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(d1.isResolved).toBe(true); // Removed
        expect(d2.isResolved).toBe(true); // Removed
        expect(d3.isResolved).toBe(false); // Kept (Limit reached)
        expect(d4.isResolved).toBe(false); // Axes ignored
    });

    it('Level 3: Removes all Helmets (Clears board)', () => {
        // SETUP: Opponent has 6 Helmets (Full Turtle Mode)
        const dice = Array(6).fill(null).map(() => createMockDie(DieFace.HELMET));
        opponent.dice = dice;

        // ACT: Execute Level 3 (Should remove 6)
        favor.execute(owner, opponent, 3);

        // ASSERT
        const remaining = dice.filter(d => !d.isResolved);
        expect(remaining.length).toBe(0); // All gone
    });

    it('Does nothing if no Helmets exist', () => {
        // SETUP: Opponent is aggressive (All Axes)
        const d1 = createMockDie(DieFace.AXE);
        opponent.dice = [d1];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(d1.isResolved).toBe(false); // Unchanged
    });
});