import type { TmuxEventName, TmuxPaneId, TmuxWindowId } from "../types";

import { handle as windowPaneChangedHandler } from "./window-pane-changed";
export function handleEvent(event: string) {
    const [eventName, ...payload] = event.split(" ");
    switch (eventName as TmuxEventName) {
        case "%window-pane-changed": {
            windowPaneChangedHandler(payload.join(" "));
        }
    }
}
