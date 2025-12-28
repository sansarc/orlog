import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TyrsPledge } from "../TyrsPledge.ts";
import { Game } from "../../Game.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('TyrsPledge', () => {
    let favor: TyrsPledge;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new TyrsPledge();
        owner = {
            name: "P1",
            damage: vi.fn()
        };
        opponent = {
            name: "P2",
            removeToken: vi.fn()
        };
        vi.clearAllMocks();
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('has correct name, icon, and target type', () => {
        expect(favor.name).toBe("Tyr's Pledge");
        expect(favor.totemImgPath).toBe("/icons/tyrs-pledge.png");
        expect(favor.targetType).toBe('SELF_HEALTH');
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

    it('does nothing when sacrifice is zero or less', () => {
        favor.execute(owner, opponent, 2, 0);

        expect(owner.damage).not.toHaveBeenCalled();
        expect(opponent.removeToken).not.toHaveBeenCalled();
        expect(Game.Notifier.info)
            .toHaveBeenCalledWith("No health sacrificed, Tyr can't destroy P2's ⌘.");
    });

    it('Level 1: sacrifices health and destroys opponent tokens', () => {
        // sacrifice 2 health, multiplier = level + 1 = 2
        favor.execute(owner, opponent, 1, 2);

        expect(owner.damage).toHaveBeenCalledWith(2);
        expect(opponent.removeToken).toHaveBeenCalledWith(4);
    });

    it('Level 3: sacrifices health and destroys opponent tokens', () => {
        // sacrifice 3 health, multiplier = 4
        favor.execute(owner, opponent, 3, 3);

        expect(owner.damage).toHaveBeenCalledWith(3);
        expect(opponent.removeToken).toHaveBeenCalledWith(12);
    });

    it('notifies the game with sacrifice and destruction info', () => {
        favor.execute(owner, opponent, 2, 1);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith(
                "P1 sacrificed 1 Health. Tyr destroys 3 of P2's ⌘."
            );
    });
});
