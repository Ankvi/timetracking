import { logger } from "@/logging";
import { handleEvent } from "./events";
import { updatePanes } from "./panes";

export async function listenToEvents() {
	const proc = Bun.spawn(["tmux", "-C", "attach"], {
		stdin: "pipe",
	});

	process.on("SIGINT", () => proc.kill());
	process.on("SIGTERM", () => proc.kill());

	const decoder = new TextDecoder();
	for await (const line of proc.stdout.values()) {
		const data = decoder.decode(line).trim();
		handleEvent(data);
	}

	logger.info("Closed tmux listener");
}

export async function start() {
	await updatePanes();
	listenToEvents();
}
