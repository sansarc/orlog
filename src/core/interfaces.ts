import type { DieFace } from "./dice/DieFace";
import type { IGodFavor } from "./favors/IGodFavor";
import type { FavorSelection } from "./Player";

export type HitType = 'DEFENSE' | 'PLAYER' | null;

export interface IDie {
    isKept: boolean;
    isLocked: boolean;
    hasToken: boolean;
    isResolved: boolean;
    readonly face: DieFace;
    readonly defenseHealth: number;
    damage: number;
    hitType: HitType;

    roll(): void;
    resolve(owner: any, opponent: any): void;
    clear(): void;
    takeHit(damage?: number): boolean;
    addDefense(amount: number): void;
}

export interface IPlayer {
    name: string;
    health: number;
    tokens: number;
    
    dice: IDie[]; 
    
    favors: IGodFavor[];
    selectedFavor: FavorSelection;  

    rollDice(): void;
    keepAllDice(): void;
    clearDice(): void;
    damage(hp?: number): void;
    heal(hp?: number): void;
    isDead(): boolean;
    addToken(tokens?: number): void;
    removeToken(tokens?: number): void;
}