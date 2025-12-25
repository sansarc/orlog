import type {DieAction} from "./DieAction.ts";

export class Shield implements DieAction {
    resolve() {
        // Passive behavior. It waits to be hit.
    }
}