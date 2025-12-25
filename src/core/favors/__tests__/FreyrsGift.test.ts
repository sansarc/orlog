import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FreyrsGift } from '../FreyrsGift.ts';
import { DieFace } from '../../dice/DieFace.ts';
import { createMockDie } from '../../../utils/testUtils.ts';

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe("Freyr's Gift", () => {
    let favor: FreyrsGift;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new FreyrsGift();
        owner = { name: "P1", dice: [] };
        opponent = { name: "P2", dice: [] };
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('Level 1: Adds +2 damage to majority AXE dice', () => {
        // SETUP: 3 Axes (majority), 2 Helmets
        const a1 = createMockDie(DieFace.AXE);
        const a2 = createMockDie(DieFace.AXE);
        const a3 = createMockDie(DieFace.AXE);
        const h1 = createMockDie(DieFace.HELMET);
        const h2 = createMockDie(DieFace.HELMET);

        owner.dice = [a1, a2, a3, h1, h2];

        const baseDamage = a1.damage;

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        [a1, a2, a3].forEach(die =>
            expect(die.damage).toBe(baseDamage + 2)
        );

        [h1, h2].forEach(die =>
            expect(die.damage).toBe(baseDamage)
        );
    });

    it('Level 2: Adds +3 defenseHealth to majority HELMET dice', () => {
        // SETUP: 3 Helmets (majority), 2 Axes
        const h1 = createMockDie(DieFace.HELMET);
        const h2 = createMockDie(DieFace.HELMET);
        const h3 = createMockDie(DieFace.HELMET);
        const a1 = createMockDie(DieFace.AXE);
        const a2 = createMockDie(DieFace.AXE);

        owner.dice = [h1, h2, h3, a1, a2];

        const baseDefense = h1.defenseHealth;

        // ACT
        favor.execute(owner, opponent, 2);

        // ASSERT
        [h1, h2, h3].forEach(die =>
            expect(die.defenseHealth).toBe(baseDefense + 3)
        );

        [a1, a2].forEach(die =>
            expect(die.defenseHealth).toBe(baseDefense)
        );
    });

    it('Level 3: Adds +4 defenseHealth to majority SHIELD dice', () => {
        // SETUP: 4 Shields (majority), 2 Axes
        const shields = Array(4)
            .fill(null)
            .map(() => createMockDie(DieFace.SHIELD));

        const axes = [
            createMockDie(DieFace.AXE),
            createMockDie(DieFace.AXE)
        ];

        owner.dice = [...shields, ...axes];

        // @ts-ignore
        const baseDefense = shields[0].defenseHealth;

        // ACT
        favor.execute(owner, opponent, 3);

        // ASSERT
        shields.forEach(die =>
            expect(die.defenseHealth).toBe(baseDefense + 4)
        );

        axes.forEach(die =>
            expect(die.defenseHealth).toBe(baseDefense)
        );
    });

    it('Ignores resolved dice when determining majority', () => {
        // SETUP:
        // 2 resolved Axes, 2 unresolved Helmets
        const a1 = createMockDie(DieFace.AXE, true);
        const a2 = createMockDie(DieFace.AXE, true);
        const h1 = createMockDie(DieFace.HELMET);
        const h2 = createMockDie(DieFace.HELMET);

        owner.dice = [a1, a2, h1, h2];

        const baseDefense = h1.defenseHealth;

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(h1.defenseHealth).toBe(baseDefense + 2);
        expect(h2.defenseHealth).toBe(baseDefense + 2);

        expect(a1.damage).toBe(1);
        expect(a2.damage).toBe(1);
    });

    it('Does nothing (but does not throw) if owner has no dice', () => {
        // SETUP
        owner.dice = [];

        // ACT / ASSERT
        expect(() => favor.execute(owner, opponent, 1)).not.toThrow();
    });

    it('Only applies bonus to unresolved dice of the majority face', () => {
        // SETUP:
        // 3 Axes total, 1 resolved → only 2 should be buffed
        const a1 = createMockDie(DieFace.AXE);
        const a2 = createMockDie(DieFace.AXE);
        const a3 = createMockDie(DieFace.AXE, true);
        const h1 = createMockDie(DieFace.HELMET);

        owner.dice = [a1, a2, a3, h1];

        const baseDamage = a1.damage;

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(a1.damage).toBe(baseDamage + 2);
        expect(a2.damage).toBe(baseDamage + 2);
        expect(a3.damage).toBe(baseDamage); // resolved → untouched
    });
});
