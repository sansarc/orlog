import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HelsGrip} from "../HelsGrip.ts";
import {DieFace} from "../../dice/DieFace.ts";
import {createMockDie} from "../../../utils/testUtils.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe('HelsGrip', () => {
    let favor: HelsGrip;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new HelsGrip();
        owner = {
            name: "P1",
            dice: [],
            heal: vi.fn()
        };
        opponent = { name: "P2" };
    });

    it('identifies as POST_COMBAT', () => {
        expect(favor.priority).toBe('POST_COMBAT');
    });

    it('Level 1: Heals 1 HP per AXE that hit the player', () => {
        // SETUP: Owner has 2 resolved AXEs that hit the player
        const d1 = createMockDie(DieFace.AXE);
        d1.isResolved = true;
        d1.hitType = 'PLAYER';

        const d2 = createMockDie(DieFace.AXE);
        d2.isResolved = true;
        d2.hitType = 'PLAYER';

        owner.dice = [d1, d2];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(owner.heal).toHaveBeenCalledWith(2); // 2 axes * 1 HP
    });

    it('Level 3: Heals 3 HP per AXE that hit the player', () => {
        // SETUP: Owner has 3 resolved AXEs
        owner.dice = Array(3).fill(null).map(() => {
            const d = createMockDie(DieFace.AXE);
            d.isResolved = true;
            d.hitType = 'PLAYER';
            return d;
        });

        // ACT
        favor.execute(owner, opponent, 3);

        // ASSERT
        expect(owner.heal).toHaveBeenCalledWith(9); // 3 axes * 3 HP
    });

    it('Does not heal for unresolved AXEs', () => {
        // SETUP: Owner has unresolved AXE
        const d1 = createMockDie(DieFace.AXE);
        d1.isResolved = false;
        d1.hitType = 'PLAYER';

        owner.dice = [d1];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(owner.heal).toHaveBeenCalledWith(0);
    });

    it('Does not heal for AXEs that hit shields', () => {
        // SETUP: Owner has AXE that hit a shield
        const d1 = createMockDie(DieFace.AXE);
        d1.isResolved = true;
        d1.hitType = 'DEFENSE';

        owner.dice = [d1];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(owner.heal).toHaveBeenCalledWith(0);
    });

    it('Ignores non-AXE dice', () => {
        // SETUP: Owner has Shields and Arrows
        const d1 = createMockDie(DieFace.SHIELD);
        d1.isResolved = true;
        d1.hitType = 'PLAYER';

        const d2 = createMockDie(DieFace.ARROW);
        d2.isResolved = true;
        d2.hitType = 'PLAYER';

        owner.dice = [d1, d2];

        // ACT
        favor.execute(owner, opponent, 1);

        // ASSERT
        expect(owner.heal).toHaveBeenCalledWith(0);
    });
});
