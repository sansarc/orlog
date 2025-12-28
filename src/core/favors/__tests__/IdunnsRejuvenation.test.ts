import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IdunnsRejuvenation } from "../IdunnsRejuvenation.ts";
import { Game } from "../../Game.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('IdunnsRejuvenation', () => {
    let favor: IdunnsRejuvenation;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new IdunnsRejuvenation();
        owner = {
            name: "P1",
            heal: vi.fn()
        };
        opponent = { name: "P2" };
        vi.clearAllMocks();
    });

    it('identifies as PRE_COMBAT', () => {
        expect(favor.priority).toBe('PRE_COMBAT');
    });

    it('has correct name and icon', () => {
        expect(favor.name).toBe("Iðunn's Rejuvenation");
        expect(favor.totemImgPath).toBe("/icons/idunns-rejuvenation.png");
    });

    it('returns correct cost per level', () => {
        expect(favor.getCost(1)).toBe(4);
        expect(favor.getCost(2)).toBe(7);
        expect(favor.getCost(3)).toBe(10);
    });

    it('returns 0 cost for invalid level', () => {
        expect(favor.getCost(0)).toBe(0);
        expect(favor.getCost(99)).toBe(0);
    });

    it('returns correct description', () => {
        expect(favor.getDescription(0))
            .toBe('Heal Health after Resolution phase.');
        expect(favor.getDescription(1))
            .toBe('Heal 2 health');
        expect(favor.getDescription(2))
            .toBe('Heal 4 health');
        expect(favor.getDescription(3))
            .toBe('Heal 6 health');
    });

    it('Level 1: Heals 2 health', () => {
        favor.execute(owner, opponent, 1);

        expect(owner.heal).toHaveBeenCalledWith(2);
    });

    it('Level 2: Heals 4 health', () => {
        favor.execute(owner, opponent, 2);

        expect(owner.heal).toHaveBeenCalledWith(4);
    });

    it('Level 3: Heals 6 health', () => {
        favor.execute(owner, opponent, 3);

        expect(owner.heal).toHaveBeenCalledWith(6);
    });

    it('notifies the game when executed', () => {
        favor.execute(owner, opponent, 2);

        expect(Game.Notifier.info)
            .toHaveBeenCalledWith('Iðunn heals 4 health!');
    });
});
