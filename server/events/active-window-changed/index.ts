import type { TmuxPaneTitle } from "../../../tmux/types";
import { handleTerminalActiveEvent } from "./terminal-active-event";

export type ActiveWindowEvent = {
	application: string;
	title: string;
};

const terminals = ["Alacritty"];

export async function activeWindowEventHandler({
	application,
	title,
}: ActiveWindowEvent) {
	if (terminals.includes(application)) {
		return await handleTerminalActiveEvent(title as TmuxPaneTitle);
	}
}
