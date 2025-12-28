import {DieActionFactory} from "./dice/DieActionFactory.ts";
import type {Player} from "./Player.ts";
import {Hand} from "./dice/Hand.ts";
import {DieFace} from "./dice/DieFace.ts";
import type {HitType, IDie} from "./interfaces.ts";

export class Die implements IDie {
    private _face = DieFace.HAND;
    private _behavior  = new Hand();

    private _isKept = false;
    private _isLocked = false;
    private _hasToken = false;
    private _isResolved = false;
    private readonly _isTemporary: boolean;

    private _defenseHealth = 1; // Used to track how many hits a shield or helmet can still absorb
    private _damage = 1; // Used to track damage that can be dealt by an axe or an arrow
    private _hitType: HitType = null;

    constructor(isTemporary: boolean = false) {
        this._isTemporary = isTemporary;
    }

    roll(): void {
        this._face = this.assign(Math.floor(Math.random() * 6));
        this._behavior = DieActionFactory.getBehavior(this._face);

        if (this._face != DieFace.AXE) // axe cannot bring a token
            this._hasToken = Math.random() < 0.5;
    }

    resolve(owner: Player, opponent: Player) {
        this._behavior.resolve(owner, opponent, this);
    }

    private assign(roll: number): DieFace {
        switch (roll) {
            case 0: return DieFace.HAND;
            case 1: return DieFace.ARROW;
            case 2: return DieFace.HELMET;
            case 3: return DieFace.SHIELD;
            case 4: // AXE has double the chances to come out
            case 5: return DieFace.AXE;
        }
        return DieFace.HAND;
    }

    clear(): void {
        this._isKept = false;
        this._isLocked = false;
        this._isResolved = false;
        this._defenseHealth = 1;
        this._damage = 1;
    }

    public takeHit(amount: number = 1): boolean {
        this._defenseHealth -= amount;
        if (this._defenseHealth <= 0) {
            this._defenseHealth = 0;
            this._isResolved = true;
            return false; // Broke
        }
        return true; // Still holds
    }

    get isTemporary(): boolean { return this._isTemporary; }

    addDefense(amount: number): void { this._defenseHealth += amount; }

    get hitType(): HitType { return this._hitType; }

    set hitType(type: HitType) { this._hitType = type; }

    set damage(amount: number) { this._damage = amount; }

    get damage(): number { return this._damage; }

    get defenseHealth(): number { return this._defenseHealth; }

    get isResolved(): boolean { return this._isResolved; }

    set isResolved(value: boolean) { this._isResolved = value; }

    get isLocked(): boolean { return this._isLocked; }

    set isLocked(value: boolean) { this._isLocked = value; }

    get face(): DieFace { return this._face; }

    set face(value: DieFace) {
        this._face = value;
        this._behavior = DieActionFactory.getBehavior(value);
    }

    get isKept(): boolean { return this._isKept; }

    set isKept(value: boolean) { this._isKept = value; }

    get hasToken(): boolean { return this._hasToken; }


}