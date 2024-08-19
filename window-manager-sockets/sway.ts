import { $, connect } from "bun";

export async function connectToSocket() {
	const socketPath = await $`sway --get-socketpath`.text();

	const socket = await connect({
		socket: {
			open: (socket) => {
				console.log("Socket to swaywm opened");

				// TODO: subscribe to 'window' events
			},
			data: (_, data) => {
				console.log(`Got sway data: ${data}`);
			},
		},
		unix: socketPath.trim(),
	});

	process.on("SIGINT", () => socket.terminate());
	process.on("SIGTERM", () => socket.terminate());
}
