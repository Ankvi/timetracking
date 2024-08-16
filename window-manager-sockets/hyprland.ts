import { join, resolve } from "node:path";
import { $, connect } from "bun";
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
} as const;

type EventName = ObjectEnum<typeof EventName>;

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
				// const event = data.toString("utf8", 0, data.length);

				console.log(payload);
				// console.log(payload);
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
