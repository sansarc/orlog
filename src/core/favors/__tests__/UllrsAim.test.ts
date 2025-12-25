import {describe, it, expect, beforeEach, vi} from 'vitest';
import {UllrsAim} from "../UllrsAim.ts";
import {DieFace} from "../../dice/DieFace.ts";
import {createMockDie} from "../../../utils/testUtils.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn() // Do nothing when called
        }
    }
}));

describe('UllrsAim', () => {
    let favor: UllrsAim;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new UllrsAim();
        owner = { name: "P1", tokens: 50 };
        opponent = { name: "P2", dice: [] };
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('Level 1: Removes up to 2 Shields', () => {
        // SETUP: Opponent has 3 Shields and 1 Arrow
        const d1 = createMockDie(DieFace.SHIELD);
        const d2 = createMockDie(DieFace.SHIELD);
        const d3 = createMockDie(DieFace.SHIELD);
        const d4 = createMockDie(DieFace.ARROW);

        opponent.dice = [d1, d2, d3, d4];

        // ACT: Execute Level 1 (Should remove 2)
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(d1.isResolved).toBe(true); // Removed
        expect(d2.isResolved).toBe(true); // Removed
        expect(d3.isResolved).toBe(false); // Kept (Limit reached)
        expect(d4.isResolved).toBe(false); // Axes ignored
    });

    it('Level 3: Removes all Shields (Clears board)', () => {
        // SETUP: Opponent has 6 Shields (Full Defense Mode)
        const dice = Array(6).fill(null).map(() => createMockDie(DieFace.SHIELD));
        opponent.dice = dice;

        // ACT: Execute Level 3 (Should remove 6)
        favor.execute(owner, opponent, 3);

        // ASSERT
        const remaining = dice.filter(d => !d.isResolved);
        expect(remaining.length).toBe(0); // All gone
    });

    it('Does nothing if no Shields exist', () => {
        // SETUP: Opponent is aggressive (All Arrows)
        const d1 = createMockDie(DieFace.ARROW);
        opponent.dice = [d1];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(d1.isResolved).toBe(false); // Still there
    });
});