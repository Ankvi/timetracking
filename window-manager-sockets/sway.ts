import { $, connect } from "bun";
import { logger } from "../logging";

export async function connectToSocket() {
	const socketPath = await $`sway --get-socketpath`.text();

	const socket = await connect({
		socket: {
			open: (socket) => {
				logger.info("Socket to swaywm opened");

				// TODO: subscribe to 'window' events
			},
			data: (_, data) => {
				logger.info(`Got sway data: ${data}`);
			},
		},
		unix: socketPath.trim(),
	});

	process.on("SIGINT", () => socket.terminate());
	process.on("SIGTERM", () => socket.terminate());
}
