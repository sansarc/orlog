import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SkuldsClaim} from "../SkuldsClaim.ts";
import {DieFace} from "../../dice/DieFace.ts";
import {createMockDie} from "../../../utils/testUtils.ts";
import {Game} from "../../Game.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('SkuldsClaim', () => {
    let favor: SkuldsClaim;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new SkuldsClaim();
        owner = { name: "P1", dice: [] };
        opponent = {
            name: "P2",
            removeToken: vi.fn()
        };
        vi.clearAllMocks();
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('returns correct cost per level', () => {
        expect(favor.getCost(1)).toBe(4);
        expect(favor.getCost(2)).toBe(6);
        expect(favor.getCost(3)).toBe(8);
    });

    it('throws on invalid cost level', () => {
        expect(() => favor.getCost(0)).toThrow();
        expect(() => favor.getCost(99)).toThrow();
    });

    it('returns correct tokens-to-remove per level', () => {
        expect(favor.getTokensToRemove(1)).toBe(2);
        expect(favor.getTokensToRemove(2)).toBe(3);
        expect(favor.getTokensToRemove(3)).toBe(4);
    });

    it('Level 1: Removes tokens based on unresolved ARROW count', () => {
        const d1 = createMockDie(DieFace.ARROW);
        const d2 = createMockDie(DieFace.ARROW);
        const d3 = createMockDie(DieFace.AXE);

        owner.dice = [d1, d2, d3];

        favor.execute(owner, opponent, 1);

        // 2 arrows * 2 tokens
        expect(opponent.removeToken).toHaveBeenCalledWith(4);
    });

    it('Level 3: Removes tokens based on unresolved ARROW count', () => {
        owner.dice = Array(3)
            .fill(null)
            .map(() => createMockDie(DieFace.ARROW));

        favor.execute(owner, opponent, 3);

        // 3 arrows * 4 tokens
        expect(opponent.removeToken).toHaveBeenCalledWith(12);
    });

    it('ignores resolved ARROW dice', () => {
        const d1 = createMockDie(DieFace.ARROW);
        const d2 = createMockDie(DieFace.ARROW);
        d1.isResolved = true;

        owner.dice = [d1, d2];

        favor.execute(owner, opponent, 2);

        // 1 unresolved arrow * 3 tokens
        expect(opponent.removeToken).toHaveBeenCalledWith(3);
    });

    it('does nothing if no ARROW dice exist', () => {
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.SHIELD);

        owner.dice = [d1, d2];

        favor.execute(owner, opponent, 2);

        expect(opponent.removeToken).toHaveBeenCalledWith(0);
    });

    it('notifies the game when executed', () => {
        const d1 = createMockDie(DieFace.ARROW);
        owner.dice = [d1];

        favor.execute(owner, opponent, 1);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith("Skuld destroys 2⌘");
    });
});
