import { describe, it, expect, beforeEach, vi } from 'vitest';
import {FreyjasPlenty} from "../FreyjasPlenty.ts";
import {DieFace} from "../../dice/DieFace.ts";
import {createMockDie} from "../../../utils/testUtils.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn() // Do nothing when called
        }
    }
}));

describe("Freyja's Plenty", () => {
    let favor: FreyjasPlenty;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new FreyjasPlenty();

        // Mock Player with a "real-ish" dice array
        owner = {
            name: "P1",
            dice: []
        };
        opponent = { name: "P2" };
    });

    it('Has correct configuration', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('Level 1: Adds 1 temporary die to the pool', () => {
        // SETUP: Owner starts with 6 standard dice
        const initialDice = Array(6).fill(null).map(() => createMockDie(DieFace.AXE));
        owner.dice = [...initialDice];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(owner.dice.length).toBe(7); // 6 + 1

        // Check the new die (last one)
        const newDie = owner.dice[6];
        expect(newDie.isTemporary).toBe(true);
        expect(newDie.face).toBeDefined(); // It should have rolled something
    });

    it('Level 3: Adds 3 temporary dice', () => {
        // SETUP: Empty hand for clarity
        owner.dice = [];

        // ACT
        favor.execute(owner, opponent, 3);

        // ASSERT
        expect(owner.dice.length).toBe(3);

        // Verify all added dice are temporary
        owner.dice.forEach((die: any) => {
            expect(die.isTemporary).toBe(true);
        });
    });

    it('Does not affect existing dice', () => {
        // SETUP
        const originalDie = createMockDie(DieFace.SHIELD, false, false);
        owner.dice = [originalDie];

        // ACT
        favor.execute(owner, opponent, 2);

        // ASSERT
        // Index 0 should still be our original non-temporary die
        expect(owner.dice[0]).toBe(originalDie);
        expect(owner.dice[0].isTemporary).toBe(false);

        // Indices 1 and 2 should be new
        expect(owner.dice[1].isTemporary).toBe(true);
        expect(owner.dice[2].isTemporary).toBe(true);
    });
});