import type { ObjectEnum } from "../types";

export const TmuxEventNames = {
	WindowPaneChanged: "window-pane-changed",
} as const;

export type TmuxEventNames = ObjectEnum<typeof TmuxEventNames>;

export type TmuxEventName = `%${TmuxEventNames}`;

export type TmuxWindowId = `@${string}`;
export type TmuxPaneId = `%${string}`;
