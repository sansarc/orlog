import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThorsStrike } from "../ThorsStrike.ts";
import { Game } from "../../Game.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('ThorsStrike', () => {
    let favor: ThorsStrike;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new ThorsStrike();
        owner = { name: "P1" };
        opponent = {
            name: "P2",
            damage: vi.fn()
        };
        vi.clearAllMocks();
    });

    it('identifies as POST_COMBAT', () => {
        expect(favor.priority).toBe('POST_COMBAT');
    });

    it('has correct name and icon', () => {
        expect(favor.name).toBe("Thor's Strike");
        expect(favor.totemImgPath).toBe("/icons/thors-strike.png");
    });

    it('returns correct cost per level', () => {
        expect(favor.getCost(1)).toBe(4);
        expect(favor.getCost(2)).toBe(8);
        expect(favor.getCost(3)).toBe(12);
    });

    it('returns 0 cost for invalid level (should never happen)', () => {
        expect(favor.getCost(0)).toBe(0);
        expect(favor.getCost(99)).toBe(0);
    });

    it('returns correct description', () => {
        expect(favor.getDescription(0))
            .toBe('Deal damage to the opponent after the Resolution phase.');
        expect(favor.getDescription(1))
            .toBe('Deal 2 damage');
        expect(favor.getDescription(2))
            .toBe('Deal 5 damage');
        expect(favor.getDescription(3))
            .toBe('Deal 8 damage');
    });

    it('Level 1: Deals 2 damage to opponent', () => {
        favor.execute(owner, opponent, 1);

        expect(opponent.damage).toHaveBeenCalledWith(2);
    });

    it('Level 2: Deals 5 damage to opponent', () => {
        favor.execute(owner, opponent, 2);

        expect(opponent.damage).toHaveBeenCalledWith(5);
    });

    it('Level 3: Deals 8 damage to opponent', () => {
        favor.execute(owner, opponent, 3);

        expect(opponent.damage).toHaveBeenCalledWith(8);
    });

    it('notifies the game when executed', () => {
        favor.execute(owner, opponent, 2);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith('Thor strikes for 5 damage!');
    });
});
