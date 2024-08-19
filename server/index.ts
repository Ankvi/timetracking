import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { name } from "../package.json";
import { type EventNames, type EventPayloads, handler } from "./handler";

const CACHE_FOLDER = `${process.env.HOME}/.cache/${name}`;
export const DEFAULT_SERVER_SOCKET = `${CACHE_FOLDER}/server.sock`;

type ServerResponse = {
	success: boolean;
};

export type ServerOpts = {
	socketPath: string;
};

export async function start({ socketPath }: ServerOpts) {
	if (!existsSync(CACHE_FOLDER)) {
		await mkdir(CACHE_FOLDER, { recursive: true });
	}

	const server = Bun.serve({
		unix: socketPath,
		async fetch(req) {
			const event = req.url.replace(
				"http://localhost/",
				"",
			) as keyof EventPayloads;
			const result = await handler(
				event,
				(await req.json()) as EventPayloads[keyof EventPayloads],
			);

			return Response.json(result);
		},
	});

	console.log("Socket opened at path", socketPath);

	process.on("SIGINT", () => server.stop());
	process.on("SIGTERM", () => server.stop());
}

export async function sendCommand<T extends keyof EventPayloads>(
	event: T,
	data: EventPayloads[T],
	opts?: ServerOpts,
) {
	const response = await fetch(`http://localhost/${event}`, {
		unix: opts?.socketPath ?? DEFAULT_SERVER_SOCKET,
		method: "POST",
		body: JSON.stringify(data),
	});

	const message = (await response.json()) as ServerResponse;
	if (!message.success) {
		console.warn("Command was unsuccessful:");
		console.warn(message);
	}
}
