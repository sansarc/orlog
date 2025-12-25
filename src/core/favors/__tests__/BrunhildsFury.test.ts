import {describe, it, expect, beforeEach, vi} from 'vitest';
import {BrunhildsFury} from "../BrunhildsFury.ts";
import {DieFace} from "../../dice/DieFace.ts";
import {createMockDie} from "../../../utils/testUtils.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('BrunhildsFury', () => {
    let favor: BrunhildsFury;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new BrunhildsFury();
        owner = { name: "P1", tokens: 50, dice: [] };
        opponent = { name: "P2", dice: [] };
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('Level 1: Multiplies AXE damage by 1.5', () => {
        // SETUP: Owner has 2 Axes and 1 Arrow
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.AXE);
        const d3 = createMockDie(DieFace.ARROW);

        owner.dice = [d1, d2, d3];

        // ACT: Execute Level 1
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(d1.damage).toBe(Math.ceil(1.5)); // Multiplied
        expect(d2.damage).toBe(Math.ceil(1.5)); // Multiplied
        expect(d3.damage).toBe(1);   // Arrows ignored
    });

    it('Level 2: Multiplies AXE damage by 2', () => {
        // SETUP: Owner has 3 Axes
        const dice = Array(3).fill(null).map(() => createMockDie(DieFace.AXE));
        owner.dice = dice;

        // ACT: Execute Level 2
        favor.execute(owner, opponent, 2);

        // ASSERT
        dice.forEach(d => expect(d.damage).toBe(2));
    });

    it('Level 3: Multiplies AXE damage by 3', () => {
        // SETUP: Owner has 4 Axes
        const dice = Array(4).fill(null).map(() => createMockDie(DieFace.AXE));
        owner.dice = dice;

        // ACT: Execute Level 3
        favor.execute(owner, opponent, 3);

        // ASSERT
        dice.forEach(d => expect(d.damage).toBe(3));
    });

    it('Ignores resolved Axes', () => {
        // SETUP: One resolved, one active
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.AXE);
        d1.isResolved = true;

        owner.dice = [d1, d2];

        // ACT
        favor.execute(owner, opponent, 2);

        // ASSERT
        expect(d1.damage).toBe(1); // Resolved, not modified
        expect(d2.damage).toBe(2); // Active, multiplied
    });

    it('Does nothing if no Axes exist', () => {
        // SETUP: Owner has only Arrows and Shields
        const d1 = createMockDie(DieFace.ARROW);
        const d2 = createMockDie(DieFace.SHIELD);
        owner.dice = [d1, d2];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(d1.damage).toBe(1);
        expect(d2.damage).toBe(1);
    });
});
