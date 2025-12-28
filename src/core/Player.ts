import { Die } from "./Die.ts"
import type { IGodFavor } from "./favors/IGodFavor.ts";
import {DieFace} from "./dice/DieFace.ts";
import type {IDie, IPlayer} from "./interfaces.ts";

export type FavorSelection = {
    favor: IGodFavor,
    level: 1 | 2 | 3,
} | null;

export class Player implements IPlayer {
    name: string;

    private _health = 15;
    private _damageTakenThisRound = 0;
    private _tokens = 0;
    private _dice: Die[] = [];
    private _favors: IGodFavor[] = [];
    private _selectedFavor : FavorSelection = null;

    constructor(name: string) {
        this.name = name;

        for (let i = 0; i < 6; i++)
            this._dice.push(new Die());
    }

    // ----- HELPERS -----

    rollDice(): void {
        for (const die of this._dice) {
            if (!die.isKept)
                die.roll();
        }
    }

    keepAllDice(): void {
        for (const die of this._dice) {
            die.isKept = true;
            die.isLocked = true;
        }
    }

    clearDice(): void {
        this._dice = this._dice.filter(die => !die.isTemporary);
        this._damageTakenThisRound = 0; // resetting at the end of round

        for (const die of this._dice)
            die.clear();
    }

    damage(hp: number = 1): void {
        this._health -= hp;
        this._damageTakenThisRound += hp;

        if (this._health < 0) this._health = 0;
    }

    heal(hp: number): void {
        this._health += hp;
        if (this._health > 15) this._health = 15;
    }

    isDead(): boolean {
        return this._health <= 0;
    }

    addToken(tokens: number = 1): void {
        this._tokens += tokens;
    }

    removeToken(tokens: number = 1): void {
        this._tokens = Math.max(0, this._tokens - tokens); // prevent negative tokens
    }

    getUnresolvedShield(): IDie | undefined {
        return this._dice.find(die =>
            die.face === DieFace.SHIELD && !die.isResolved
        );
    }

    getUnresolvedHelmet(): IDie | undefined {
        return this._dice.find(die =>
            die.face === DieFace.HELMET && !die.isResolved
        );
    }

    reset(): void {
        this._health = 15;
        this._tokens = 0;
        this.clearDice();
        this._damageTakenThisRound = 0;
        this._favors = [];
    }

    toString(): string {
        return this.name;
    }

    // ----- GETTERS & SETTERS -----

    set favors(favors: IGodFavor[]) {
        if (favors.length > 3) throw new Error("Max 3 favors allowed!");
        this._favors = favors;
    }

    set selectedFavor(favor: FavorSelection) { this._selectedFavor = favor; }

    get favors(): IGodFavor[] { return this._favors; }

    get selectedFavor(): FavorSelection { return this._selectedFavor; }

    get health(): number { return this._health; }

    set health(hp: number) { this._health = Math.min(15, hp); }

    get damageTakenThisRound(): number { return this._damageTakenThisRound; }

    get tokens(): number { return this._tokens; }

    set tokens(tokens: number) { this._tokens = tokens; }

    get dice(): Die[] { return this._dice; }
}