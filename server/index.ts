import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { logger } from "@/logging";
import { ServerNotRunningError } from "@/types";
import { CACHE_FOLDER, DEFAULT_SERVER_SOCKET } from "../program-data";
import { type EventPayloads, handler } from "./handler";

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

    logger.info("Socket opened at path", socketPath);

    return {
        stop: async () => {
            server.stop(true);
            await rm(socketPath);
        },
    };
}

export async function stop({ socketPath }: ServerOpts) {
    try {
        if (!existsSync(socketPath)) {
            return;
        }
        await sendCommand("shutdown", undefined);
    } catch (error) {
        if (error instanceof ServerNotRunningError) {
            await rm(socketPath);
        }
    }
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
                throw new ServerNotRunningError();
            }
            logger.error(error);
        }
    }
}
