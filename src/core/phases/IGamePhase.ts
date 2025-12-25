import type { Die } from "../Die";
import type { IGodFavor } from "../favors/IGodFavor";

export interface IGamePhase {
    name: string;
    readonly canRoll?: boolean;
    readonly currentBudget?: number;

    handleRollClick?(): void;
    handleDieClick?(die: Die): void;
    handleFavorPick?(favor: IGodFavor | null, level: 1 | 2 | 3): void;
    handleConfirmClick?(): void;

    endPhase(): void;
}