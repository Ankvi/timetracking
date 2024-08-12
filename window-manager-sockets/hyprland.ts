import { join, resolve } from "node:path";
import { $, connect } from "bun";

type Instance = {
	instance: string;
	time: number;
	pid: number;
	wl_socket: string;
};

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
			data: (socket, data) => {
				const [event, payload] = data.toString("utf8").split(">>", 1);
				console.log("Received event:");
				console.log(event);
				console.log(payload);
			},
		},
		unix: socketPath,
	});

	process.on("SIGINT", () => socket.terminate());
	process.on("SIGTERM", () => socket.terminate());
}
