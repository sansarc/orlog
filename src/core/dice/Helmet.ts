import type {DieAction} from "./DieAction.ts";

export class Helmet implements DieAction {
    resolve() {
        // Passive behavior. It waits to be hit.
    }
}