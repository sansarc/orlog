import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../../Game';
import {ThrymrsTheft} from "../ThrymrsTheft.ts";

vi.mock('../../Game', () => ({
    Game: {
        Notifier: {
            info: vi.fn()
        }
    }
}));

describe("Thrymr's Theft", () => {
    let favor: ThrymrsTheft;
    let owner: any;
    let opponent: any;

    beforeEach(() => {
        favor = new ThrymrsTheft();

        // Mock Owner with token tracking
        owner = {
            name: "Player 1",
            tokens: 0,
            addToken: vi.fn((amount: number) => {
                owner.tokens += amount;
            })
        };

        opponent = {
            name: "Player 2",
            selectedFavor: null // Start with no favor
        };

        vi.clearAllMocks();
    });

    it('Has correct configuration', () => {
        expect(favor.name).toBe("Thrymr's Theft");
        expect(favor.priority).toBe('IMMEDIATE');
        expect(favor.getCost(1)).toBe(3);
        expect(favor.getCost(2)).toBe(6);
        expect(favor.getCost(3)).toBe(9);
    });

    describe('Refund Logic (Opponent has no favor)', () => {
        it('Refunds the cost to the owner if opponent has no favor selected', () => {
            // Setup: Opponent has no favor
            opponent.selectedFavor = null;
            const level = 2; // Cost is 6

            // Execute
            favor.execute(owner, opponent, level);

            // Assert
            expect(owner.addToken).toHaveBeenCalledWith(6); // Refunded 6 tokens
            expect(owner.tokens).toBe(6);
            expect(Game.Notifier.info).toHaveBeenCalledWith(
                expect.stringContaining("Thrymr refunds 6⌘")
            );
        });
    });

    describe('Downgrade Logic (Opponent has favor)', () => {
        it('Reduces opponent favor level if resulting level is >= 1', () => {
            // Setup: Opponent has a Level 3 favor
            opponent.selectedFavor = {
                favor: { name: "Thor's Strike" },
                level: 3
            };

            // Execute: Thrymr Level 1 (Reduce by 1)
            favor.execute(owner, opponent, 1);

            // Assert
            expect(opponent.selectedFavor.level).toBe(2); // 3 - 1 = 2
            expect(opponent.selectedFavor).not.toBeNull();
            expect(Game.Notifier.info).toHaveBeenCalledWith(
                expect.stringContaining("downgrades Player 2's Thor's Strike to level 2")
            );

            // Ensure NO refund happened
            expect(owner.addToken).not.toHaveBeenCalled();
        });

        it('Removes opponent favor entirely if resulting level is < 1', () => {
            // Setup: Opponent has a Level 2 favor
            opponent.selectedFavor = {
                favor: { name: "Vidar's Might" },
                level: 2
            };

            // Execute: Thrymr Level 2 (Reduce by 2)
            // 2 - 2 = 0, which is < 1, so it should be removed
            favor.execute(owner, opponent, 2);

            // Assert
            expect(opponent.selectedFavor).toBeNull();
            expect(Game.Notifier.info).toHaveBeenCalledWith(
                expect.stringContaining("removing it entirely")
            );
        });

        it('Removes opponent favor if reduction is massive (Negative Level)', () => {
            // Setup: Opponent has Level 1 favor
            opponent.selectedFavor = {
                favor: { name: "Idun's Rejuvenation" },
                level: 1
            };

            // Execute: Thrymr Level 3 (Reduce by 3)
            favor.execute(owner, opponent, 3);

            // Assert
            expect(opponent.selectedFavor).toBeNull();
        });
    });
});