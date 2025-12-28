import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../Game';
import {DieFace} from "../dice/DieFace.ts";
import {ResolutionPhase} from "../phases/ResolutionPhase.ts";
import type {Die} from "../Die.ts";

function setDice(player: any, faces: DieFace[]) {
    player.clearDice();

    player.dice.forEach((die: Die, index: number) => {
        if (faces[index])
            die.face = faces[index];
        else {
            // marked as used so it won't interfere
            die.isResolved = true;
        }
    });
}

describe('Combat Resolution', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
        game['_phase'] = new ResolutionPhase(game);

        game.player1.health = 15;
        game.player2.health = 15;
        game.player1.tokens = 0;
        game.player2.tokens = 5; // give P2 some tokens to steal
    });

    it('Axes deal damage to opponent when unopposed', () => {
        // P1: 2 Axes
        // P2: non-defensive
        setDice(game.player1, [DieFace.AXE, DieFace.AXE]);
        setDice(game.player2, [DieFace.HAND, DieFace.HAND]); // Hands don't block axes

        (game.phase as ResolutionPhase).resolveDiceCombat();

        expect(game.player2.health).toBe(13); // 15 - 2
    });

    it('Helmets block Axes 1-to-1', () => {
        // P1: 3 Axes
        // P2: 2 Helmets
        setDice(game.player1, [DieFace.AXE, DieFace.AXE, DieFace.AXE]);
        setDice(game.player2, [DieFace.HELMET, DieFace.HELMET]);

        (game.phase as ResolutionPhase).resolveDiceCombat();

        // 3 Axes - 2 Helmets = 1 Damage
        expect(game.player2.health).toBe(14);
    });

    it('Hands steal tokens from opponent', () => {
        // P1: 2 Hands, 4 Helmets (Passive)
        setDice(game.player1, [DieFace.HAND, DieFace.HAND]);

        // P2: 6 Helmets (Passive - cannot block Hands or deal damage)
        setDice(game.player2, []);

        (game.phase as ResolutionPhase).resolveDiceCombat();

        expect(game.player1.tokens).toBe(2);
        expect(game.player2.tokens).toBe(3);
    });

    it('Arrows ignore Helmets but are blocked by Shields', () => {
        setDice(game.player1, [DieFace.ARROW]);
        setDice(game.player2, [DieFace.HELMET]); // Wrong defense

        (game.phase as ResolutionPhase).resolveDiceCombat();

        expect(game.player2.health).toBe(14); // Arrow goes through helmet
    });
});