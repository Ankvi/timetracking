import { connect } from "bun";

const SOCKET_PATH = "/tmp/tmux-1000/default";

export async function connectToSocket() {
	const socket = await connect({
		unix: SOCKET_PATH,
		socket: {
			open: () => {
				console.log("tmux socket opened");
			},
			data: (socket, data) => {
				const payload = data.toString("utf8");
				console.log(payload);
			},
			close: () => {
				console.log("tmux socket closed");
			},
		},
	});

	console.log("Connected to tmux socket");

	process.on("SIGINT", () => socket.terminate());
	process.on("SIGTERM", () => socket.terminate());
}
