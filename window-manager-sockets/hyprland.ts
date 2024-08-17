import { join } from "node:path";
import { $, connect } from "bun";
import { sendCommand } from "../server";
import { EventNames } from "../server/handler";
import type { ObjectEnum } from "../types";

type Instance = {
	instance: string;
	time: number;
	pid: number;
	wl_socket: string;
};

// Retrieved from https://wiki.hyprland.org/IPC/
const EventName = {
	ActiveWindow: "activewindow",
	ActiveWindowV2: "activewindowv2",
	WindowTitle: "windowtitle",
	WindowTitleV2: "windowtitlev2",
} as const;

type EventName = ObjectEnum<typeof EventName>;

async function onTerminalActiveEvent(payload: string) {
	const shell = $.cwd(payload);
	const currentBranch = (
		await shell`git rev-parse --abbrev-ref HEAD`.text()
	).trim();

	await sendCommand(EventNames.GitBranchChanged, {
		directory: payload,
		branch: currentBranch,
	});
}

async function handleEvent(event: string) {
	const [eventName, payload] = event.split(">>", 2) as [EventName, string];
	switch (eventName) {
		case EventName.ActiveWindow: {
			const [application, title] = payload.split(",", 2);
			if (application === "Alacritty") {
				await onTerminalActiveEvent(title);
			}
		}
	}
}

export async function connectToSocket() {
	const instances: Instance[] = await $`hyprctl instances -j`.json();

	if (!instances.length) {
		throw new Error("Current system is not running hyprland");
	}

	if (instances.length > 1) {
		throw new Error("More than one instance of hyprland detected");
	}

	const instance = instances[0];

	const socketPath = join(
		Bun.env.XDG_RUNTIME_DIR,
		"hypr",
		instance.instance,
		".socket2.sock",
	);

	const socket = await connect({
		socket: {
			open: () => {
				console.log("hyprland socket opened");
			},
			data: (socket, data) => {
				const payload = data.toString("utf8");
				const events = payload.split("\n");
				for (const event of events) {
					handleEvent(event);
				}
			},
			close: () => {
				console.log("hyprland socket closed");
			},
		},
		unix: socketPath,
	});

	console.log("Connected to hyprland socket");

	process.on("SIGINT", () => socket.terminate());
	process.on("SIGTERM", () => socket.terminate());
}
