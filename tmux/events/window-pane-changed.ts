import { sendCommand } from "../../server";
import { EventNames } from "../../server/handler";
// import { getProjectFromTitle } from "../panes";
import type { TmuxPaneId, TmuxWindowId } from "../types";
import { getProjectFromTitle } from "../windows";

export async function handle(payload: string) {
	const [windowId, paneId] = payload.split(" ", 2) as [
		TmuxWindowId,
		TmuxPaneId,
	];

	const { directory, branch } = await getProjectFromTitle(windowId);

	return await sendCommand(EventNames.ActiveWindowChanged, {
		application: "tmux",
		directory,
		branch,
	});
}
