import { sendCommand } from "../../server";
import { EventNames } from "../../server/handler";
import { updatePaneDirectory } from "../panes";
import type { TmuxPaneId, TmuxWindowId } from "../types";

export async function handle(payload: string) {
	const [windowId, paneId] = payload.split(" ", 2) as [
		TmuxWindowId,
		TmuxPaneId,
	];

	const directory = await updatePaneDirectory(paneId);

	if (!directory) {
		return;
	}

	return await sendCommand(EventNames.ActiveWindowChanged, {
		application: "tmux",
		directory,
	});
}
