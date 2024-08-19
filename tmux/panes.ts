import { $ } from "bun";
import type { TmuxPaneId } from "./types";

const tmuxPanes = new Map<TmuxPaneId, string>();

export async function updatePaneDirectory(paneId: TmuxPaneId) {
	const directory = await getPaneDirectory(paneId, true);
	if (!directory) {
		console.warn(`Could not get directory for pane: ${paneId}`);
		return;
	}
	tmuxPanes.set(paneId, directory);
	return directory;
}

export async function updatePanes() {
	const delimiter = ";;";
	const panesResponse =
		await $`tmux list-panes -aF "#{pane_id}${delimiter}#{pane_current_path}`.text();

	const lines = panesResponse
		.trimEnd()
		.split("\n")
		.map((line) => line.split(delimiter, 2) as [TmuxPaneId, string]);

	tmuxPanes.clear();

	for (const line of lines) {
		const [id, directory] = line;
		tmuxPanes.set(id, directory);
	}
}

export async function getPaneDirectory<TForce extends boolean>(
	paneId: TmuxPaneId,
	force?: TForce,
): Promise<string | undefined> {
	if (force) {
		const directory = (
			await $`tmux display -pt ${paneId} "#{pane_current_path}`.text()
		).trimEnd();
		return directory;
	}
	return tmuxPanes.get(paneId);
}
