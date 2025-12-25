import type {IDie, IPlayer} from "../interfaces.ts";

export type FavorPriority = 'PRE_COMBAT' | 'POST_COMBAT';
export type FavorTargetType = 'OPPONENT_DICE' | 'OWN_DICE' | 'ANY_DICE';

export interface IGodFavor {
    name: string;
    totemImgPath: string;
    priority: FavorPriority;
    targetType?: FavorTargetType;

    getCost(level: number): number;
    getDescription(level: number): string;
    getSelectionLimit?(level: number): number;
    execute(owner: IPlayer, opponent: IPlayer, level: number, targets?: IDie[]): void;
}