import type {IDie, IPlayer} from "../interfaces.ts";

export type FavorPriority = 'PRE_COMBAT' | 'POST_COMBAT' | 'IMMEDIATE'; // IMMEDIATE: executed as first regardless of the players turn order
export type FavorTargetType = 'OPPONENT_DICE' | 'OWN_DICE' | 'ANY_DICE' | 'SELF_HEALTH';

export interface IGodFavor {
    name: string;
    totemImgPath: string;
    priority: FavorPriority;
    targetType?: FavorTargetType;

    getCost(level: number): number;
    getDescription(level: number): string;
    getSelectionLimit?(level: number): number;
    execute(owner: IPlayer, opponent: IPlayer, level: number, target?: IDie[] | number): void;
}