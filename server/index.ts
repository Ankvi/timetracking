import { existsSync, rmSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { logger } from "../logging";
import { name } from "../package.json";
import { type EventPayloads, handler } from "./handler";

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

	if (existsSync(socketPath)) {
		logger.info("Server already running. Exiting");
		process.exit(0);
	}

	const server = Bun.serve({
		unix: socketPath,
		async fetch(req) {
			const event = req.url.replace(
				"http://localhost/",
				"",
			) as keyof EventPayloads;
			const body = req.body
				? ((await req.json()) as EventPayloads[keyof EventPayloads])
				: undefined;
			const result = await handler(event, body);

			return Response.json(result);
		},
		error: async (error) => {
			logger.error({
				error: error.message,
				message: "Server error",
			});

			return Response.error();
		},
	});

	function stop() {
		server.stop(true);
		rmSync(socketPath);
	}

	logger.info("Socket opened at path", socketPath);

	process.on("SIGINT", () => stop());
	process.on("SIGTERM", () => stop());
}

export async function sendCommand<T extends keyof EventPayloads>(
	event: T,
	data: EventPayloads[T],
	opts?: ServerOpts,
) {
	try {
		const response = await fetch(`http://localhost/${event}`, {
			unix: opts?.socketPath ?? DEFAULT_SERVER_SOCKET,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === "FailedToOpenSocket") {
				logger.info("Timetracking server is currently not running");
				return;
			}
			logger.error(error);
		}
	}
	//
	// const message = (await response.json()) as ServerResponse;
	// if (!message.success) {
	// 	logger.warn("Command was unsuccessful:");
	// 	logger.warn(message);
	// }
}
