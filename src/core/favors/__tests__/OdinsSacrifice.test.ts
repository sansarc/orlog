import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OdinsSacrifice } from "../OdinsSacrifice.ts";
import { Game } from "../../Game.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('OdinsSacrifice', () => {
    let favor: OdinsSacrifice;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new OdinsSacrifice();
        owner = {
            name: "P1",
            damage: vi.fn(),
            addToken: vi.fn()
        };
        opponent = { name: "P2" };
        vi.clearAllMocks();
    });

    it('identifies as POST_COMBAT', () => {
        expect(favor.priority).toBe('POST_COMBAT');
    });

    it('has correct name, icon, and target type', () => {
        expect(favor.name).toBe("Odin's Sacrifice");
        expect(favor.totemImgPath).toBe('/icons/odins-sacrifice.png');
        expect(favor.targetType).toBe('SELF_HEALTH');
    });

    it('returns correct cost per level', () => {
        expect(favor.getCost(1)).toBe(6);
        expect(favor.getCost(2)).toBe(8);
        expect(favor.getCost(3)).toBe(10);
    });

    it('throws on invalid cost level', () => {
        expect(() => favor.getCost(0)).toThrow();
        expect(() => favor.getCost(99)).toThrow();
    });

    it('returns correct token multiplier per level', () => {
        expect(favor.getTokenMultiplier(1)).toBe(3);
        expect(favor.getTokenMultiplier(2)).toBe(4);
        expect(favor.getTokenMultiplier(3)).toBe(5);
    });

    it('does nothing when sacrifice is zero or less', () => {
        favor.execute(owner, opponent, 2, 0);

        expect(owner.damage).not.toHaveBeenCalled();
        expect(owner.addToken).not.toHaveBeenCalled();
        expect(Game.Notifier.info)
            .toHaveBeenCalledWith("No health sacrificed, Odin can't deal tokens.");
    });

    it('Level 1: Sacrifices health and grants tokens', () => {
        // sacrifice 2 health, multiplier = 3
        favor.execute(owner, opponent, 1, 2);

        expect(owner.damage).toHaveBeenCalledWith(2);
        expect(owner.addToken).toHaveBeenCalledWith(6);
    });

    it('Level 3: Sacrifices health and grants tokens', () => {
        // sacrifice 3 health, multiplier = 5
        favor.execute(owner, opponent, 3, 3);

        expect(owner.damage).toHaveBeenCalledWith(3);
        expect(owner.addToken).toHaveBeenCalledWith(15);
    });

    it('notifies the game with sacrifice and reward info', () => {
        favor.execute(owner, opponent, 2, 1);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith("P1 sacrificed 1 Health. Odin grants 4⌘.");
    });
});
