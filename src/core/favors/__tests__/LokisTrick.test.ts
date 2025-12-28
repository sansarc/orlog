import {beforeEach, describe, expect, it, vi} from "vitest";
import {LokisTrick} from "../LokisTrick.ts";
import {createMockDie} from "../../../utils/testUtils.ts";
import {DieFace} from "../../dice/DieFace.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn() // Do nothing when called
        }
    }
}));

describe("Loki's Trick", () => {
    let favor: LokisTrick;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new LokisTrick();

        // Mock players
        owner = { name: "P1", dice: [] };
        opponent = { name: "P1", dice: [] };
    });

    it('Has correct configuration', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
        expect(favor.targetType).toBe('OPPONENT_DICE');
    });

    it('Level 1 allows selecting up to 2 dice', () => {
        // Loki's budget: Level
        expect(favor.getSelectionLimit(1)).toBe(1);
        expect(favor.getSelectionLimit(2)).toBe(2);
        expect(favor.getSelectionLimit(3)).toBe(3);
    });

    it('Bans ONLY on selected dice', () => {
        // SETUP: Opponent has 3 Axes
        const d1 = createMockDie(DieFace.AXE);
        const d2 = createMockDie(DieFace.AXE);
        opponent.dice = [d1, d2];

        // ACTION: Player selects d2 to ban
        favor.execute(owner, opponent, 1, [d2]);

        // ASSERT
        // 1. Check if the right dice is being set as resolved
        expect(d2.isResolved).toBe(true);

        // 2. Check if d1 was left unchanged
        expect(d1.isResolved).toBe(false);
    });

    it('Handles empty selection gracefully', () => {
        opponent.dice =[createMockDie(DieFace.ARROW)]

        // empty selection
        favor.execute(owner, opponent, 1, []);

        expect(opponent.dice[0].isResolved).toBe(false);
    });
});