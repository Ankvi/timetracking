import { join } from "node:path";
import { $, connect } from "bun";
import { logger } from "../logging";
import type { ObjectEnum } from "../types";
import { handle as activeWindow } from "./events/active-window";
import type { WMSocket } from "./types";

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

async function handleEvent(event: string) {
	const [eventName, payload] = event.split(">>", 2) as [EventName, string];
	switch (eventName) {
		case EventName.ActiveWindow: {
			const [application, title] = payload.split(",", 2);
			return await activeWindow(application, title);
		}

		default: {
			// logger.debug(
			// 	`Got hyprland event "${eventName}" with payload:\n${payload}`,
			// );
		}
	}
}

export async function connectToSocket(): Promise<WMSocket> {
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
				logger.info("hyprland socket opened");
			},
			data: (_, data) => {
				const payload = data.toString("utf8").trim();
				const events = payload.split("\n");
				for (const event of events) {
					handleEvent(event);
				}
			},
			close: () => {
				logger.info("hyprland socket closed");
			},
		},
		unix: socketPath,
	});

	return socket;
}
