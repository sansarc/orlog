import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BragisVerve} from "../BragisVerve.ts";
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

describe('BragisVerve', () => {
    let favor: BragisVerve;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new BragisVerve();
        owner = {
            name: "P1",
            dice: [],
            addToken: vi.fn()
        };
        opponent = { name: "P2" };
        vi.clearAllMocks();
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('has correct name and icon', () => {
        expect(favor.name).toBe("Bragi's Verve");
        expect(favor.totemImgPath).toBe('/icons/bragis-verve.png');
    });

    it('returns correct cost per level', () => {
        expect(favor.getCost(1)).toBe(4);
        expect(favor.getCost(2)).toBe(8);
        expect(favor.getCost(3)).toBe(12);
    });

    it('throws on invalid cost level', () => {
        expect(() => favor.getCost(0)).toThrow();
        expect(() => favor.getCost(99)).toThrow();
    });

    it('Level 1: Gains tokens for each unresolved HAND', () => {
        const d1 = createMockDie(DieFace.HAND);
        const d2 = createMockDie(DieFace.HAND);
        const d3 = createMockDie(DieFace.AXE);

        owner.dice = [d1, d2, d3];

        favor.execute(owner, opponent, 1);

        // 2 hands * (1 + 1)
        expect(owner.addToken).toHaveBeenCalledWith(4);
    });

    it('Level 3: Gains tokens for each unresolved HAND', () => {
        owner.dice = Array(3)
            .fill(null)
            .map(() => createMockDie(DieFace.HAND));

        favor.execute(owner, opponent, 3);

        // 3 hands * (3 + 1)
        expect(owner.addToken).toHaveBeenCalledWith(12);
    });

    it('ignores resolved HAND dice', () => {
        const d1 = createMockDie(DieFace.HAND);
        const d2 = createMockDie(DieFace.HAND);
        d1.isResolved = true;

        owner.dice = [d1, d2];

        favor.execute(owner, opponent, 2);

        // 1 unresolved hand * (2 + 1)
        expect(owner.addToken).toHaveBeenCalledWith(3);
    });

    it('does nothing if no HAND dice exist', () => {
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.SHIELD);

        owner.dice = [d1, d2];

        favor.execute(owner, opponent, 2);

        expect(owner.addToken).toHaveBeenCalledWith(0);
    });

    it('notifies the game when executed', () => {
        const d1 = createMockDie(DieFace.HAND);
        owner.dice = [d1];

        favor.execute(owner, opponent, 1);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith('Bragi adds 2 tokens from hands.');
    });
});
