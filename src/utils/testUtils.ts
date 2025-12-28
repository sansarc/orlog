import {vi} from "vitest";
import type {DieFace} from "../core/dice/DieFace.ts";
import type {HitType, IDie} from "../core/interfaces.ts";

export function createMockDie(face: DieFace | string, isResolved: boolean = false, isTemporary: boolean = false) {
    return {
        face,
        isResolved: isResolved,
        isKept: false,
        isLocked: false,
        isTemporary: isTemporary,
        hasToken: false,
        defenseHealth: 1,
        hitType: null as HitType,
        damage: 1,

        takeHit: vi.fn(function(this: any, damage?: number) {
            this.defenseHealth -= damage || 1;
            if (this.defenseHealth <= 0) {
                this.isResolved = true;
                return false;
            }
            return true;
        }),

        addDefense: vi.fn(function(this: any, amount: number) {
            this.defenseHealth += amount;
        }),

        roll: vi.fn(),
        resolve: vi.fn(),
        clear: vi.fn(),

    } as IDie;
}
