import type {DieAction} from './DieAction.ts';
import {Axe} from './Axe.ts';
import {Shield} from './Shield.ts';
import {Helmet} from './Helmet.ts';
import {Arrow} from './Arrow.ts';
import {Hand} from './Hand.ts';
import {DieFace} from "./DieFace.ts";

export class DieActionFactory {
    private static readonly _cache: Map<DieFace, DieAction> = new Map();

    static getBehavior(face: DieFace): DieAction {
        if (this._cache.has(face)) {
            let action = this._cache.get(face);
            if (action) return action;
        }

        let action: DieAction;
        switch (face) {
            case DieFace.AXE:
                action = new Axe();
                break;
            case DieFace.SHIELD:
                action = new Shield();
                break;
            case DieFace.HELMET:
                action = new Helmet();
                break;
            case DieFace.ARROW:
                action = new Arrow();
                break;
            case DieFace.HAND:
                action = new Hand();
                break;

            default:
                throw new Error(`No action defined for ${face}`);
        }

        this._cache.set(face, action);
        return action;
    }
}