import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VarsBond } from "../VarsBond.ts";
import { Game } from "../../Game.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('VarsBond', () => {
    let favor: VarsBond;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new VarsBond();
        owner = {
            name: "P1",
            heal: vi.fn()
        };
        opponent = {
            name: "P2",
            selectedFavor: null
        };
        vi.clearAllMocks();
    });

    it('identifies as POST_COMBAT', () => {
        expect(favor.priority).toBe('POST_COMBAT');
    });

    it('has correct name and icon', () => {
        expect(favor.name).toBe("Vár's Bond");
        expect(favor.totemImgPath).toBe("/icons/vars-bond.png");
    });

    it('returns correct cost per level', () => {
        expect(favor.getCost(1)).toBe(10);
        expect(favor.getCost(2)).toBe(14);
        expect(favor.getCost(3)).toBe(18);
    });

    it('throws on invalid cost level', () => {
        expect(() => favor.getCost(0)).toThrow();
        expect(() => favor.getCost(99)).toThrow();
    });

    it('does nothing if opponent selected no favor', () => {
        opponent.selectedFavor = null;

        favor.execute(owner, opponent, 2);

        expect(owner.heal).not.toHaveBeenCalled();
        expect(Game.Notifier.info)
            .toHaveBeenCalledWith("P2 selected no favor. Vár can't heal.");
    });

    it('heals owner based on opponent favor cost and level', () => {
        opponent.selectedFavor = {
            level: 2,
            favor: {
                getCost: vi.fn().mockReturnValue(14)
            }
        };

        // level 1 => multiplier = 2 * 1
        favor.execute(owner, opponent, 1);

        expect(opponent.selectedFavor.favor.getCost)
            .toHaveBeenCalledWith(2);
        expect(owner.heal).toHaveBeenCalledWith(14);
    });

    it('scales healing with VarsBond level', () => {
        opponent.selectedFavor = {
            level: 3,
            favor: {
                getCost: vi.fn().mockReturnValue(18)
            }
        };

        // level 2 => opponentFavorLevel * level = 6
        favor.execute(owner, opponent, 2);

        expect(opponent.selectedFavor.favor.getCost)
            .toHaveBeenCalledWith(6);
        expect(owner.heal).toHaveBeenCalledWith(18);
    });

    it('notifies the game when healing occurs', () => {
        opponent.selectedFavor = {
            level: 1,
            favor: {
                getCost: vi.fn().mockReturnValue(10)
            }
        };

        favor.execute(owner, opponent, 1);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith('Vár heals 1');
    });
});
