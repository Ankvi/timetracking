import { connect } from "bun";

const SOCKET_PATH = "/tmp/tmux-1000/default";

export async function connectToSocket() {
	const socket = await connect({
		unix: SOCKET_PATH,
		socket: {
			data: (socket, data) => {},
		},
	});

	process.on("SIGINT", () => socket.terminate());
	process.on("SIGTERM", () => socket.terminate());
}
