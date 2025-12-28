import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkadisHunt } from "../SkadisHunt.ts";
import { DieFace } from "../../dice/DieFace.ts";
import { createMockDie } from "../../../utils/testUtils.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('SkadisHunt', () => {
    let favor: SkadisHunt;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new SkadisHunt();
        owner = { name: "P1", dice: [] };
        opponent = { name: "P2", dice: [] };
    });

    it('has correct name and icon', () => {
        expect(favor.name).toBe("Skaði's Hunt");
        expect(favor.totemImgPath).toBe("/icons/skadis-hunt.png");
    });

    it('throws on invalid level cost', () => {
        expect(() => favor.getCost(0)).toThrow();
        expect(() => favor.getCost(99)).toThrow();
    });

    it('Level 1: Adds +1 damage to each unresolved ARROW', () => {
        const d1 = createMockDie(DieFace.ARROW);
        const d2 = createMockDie(DieFace.ARROW);
        const d3 = createMockDie(DieFace.AXE);

        owner.dice = [d1, d2, d3];

        favor.execute(owner, opponent, 1);

        expect(d1.damage).toBe(2);
        expect(d2.damage).toBe(2);
        expect(d3.damage).toBe(1); // Non-arrow ignored
    });

    it('Level 2: Adds +2 damage to each unresolved ARROW', () => {
        const dice = Array(3)
            .fill(null)
            .map(() => createMockDie(DieFace.ARROW));

        owner.dice = dice;

        favor.execute(owner, opponent, 2);

        dice.forEach(d => expect(d.damage).toBe(3));
    });

    it('Level 3: Adds +3 damage to each unresolved ARROW', () => {
        const dice = Array(4)
            .fill(null)
            .map(() => createMockDie(DieFace.ARROW));

        owner.dice = dice;

        favor.execute(owner, opponent, 3);

        dice.forEach(d => expect(d.damage).toBe(4));
    });

    it('ignores resolved ARROW dice', () => {
        const d1 = createMockDie(DieFace.ARROW);
        const d2 = createMockDie(DieFace.ARROW);
        d1.isResolved = true;

        owner.dice = [d1, d2];

        favor.execute(owner, opponent, 2);

        expect(d1.damage).toBe(1); // Resolved, unchanged
        expect(d2.damage).toBe(3); // Active, boosted
    });

    it('does nothing if no ARROW dice exist', () => {
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.SHIELD);

        owner.dice = [d1, d2];

        favor.execute(owner, opponent, 2);

        expect(d1.damage).toBe(1);
        expect(d2.damage).toBe(1);
    });
});
