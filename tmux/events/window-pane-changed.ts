import { sendCommand } from "../../server";
import { EventNames } from "../../server/handler";
import { getProjectFromTitle } from "../panes";
import type { TmuxPaneId, TmuxWindowId } from "../types";

export async function handle(payload: string) {
	const [_, paneId] = payload.split(" ", 2) as [TmuxWindowId, TmuxPaneId];

	const { directory, branch } = await getProjectFromTitle(paneId);

	return await sendCommand(EventNames.ActiveWindowChanged, {
		application: "tmux",
		title: ["tmux", directory, branch].join(" | "),
	});
}
