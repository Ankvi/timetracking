#!/usr/bin/env bun

import { Command } from "commander";
import { logger, logging } from "./logging";
import { DEFAULT_SERVER_SOCKET } from "./program-data";
import * as server from "./server";
import * as tmux from "./tmux";
import * as toggl from "./toggl";
import { ServerNotRunningError } from "./types";
import * as windowManagers from "./window-manager-sockets";
import type { WindowManager } from "./window-manager-sockets/types";

const program = new Command("timetracking");

type BaseOptions = {
    verbose?: boolean;
};

program.option("-v, --verbose");

type StartOptions = server.ServerOpts & {
    manager: WindowManager;
};

program
    .command("start")
    .description("Start the timetracking process")
    .option(
        "-m, --manager <WINDOW_MANAGER>",
        "Window manager to connect to. Defaults to $XDG_CURRENT_DESKTOP",
        process.env.XDG_CURRENT_DESKTOP,
    )
    .option(
        "-s, --socketPath <SOCKET_PATH>",
        "Optional socket path to use instead of the default one",
        DEFAULT_SERVER_SOCKET,
    )
    .action(async (args: StartOptions) => {
        const serverSocket = await server.start({
            socketPath: args.socketPath,
        });

        const wmSocket = await windowManagers.connect(args.manager);

        // const tmuxProcess = tmux.start();

        async function cleanup() {
            await toggl
                .stopTimer()
                .catch(() => logger.warn("Stopping timer failed"));
            await wmSocket.terminate();
            await serverSocket.stop();
            // tmuxProcess.kill();
        }

        process.on("SIGINT", cleanup);
        process.on("SIGTERM", cleanup);
        process.on("SIGKILL", cleanup);
    });

program.command("resume").action(async () => {
    await server.sendCommand("resume", undefined);
});

program.command("pause").action(async () => {
    await server.sendCommand("pause", undefined);
});

program.command("before-sleep").action(async () => {
    await server.sendCommand("before-sleep", undefined);
});

program.command("after-awake").action(async () => {
    await server.sendCommand("after-awake", undefined);
});

program
    .command("stop")
    .option(
        "-s, --socketPath <SOCKET_PATH>",
        "Optional socket path to use instead of the default one",
        DEFAULT_SERVER_SOCKET,
    )
    .action(async (opts: server.ServerOpts) => {
        await server.stop(opts);
    });

program
    .command("current-entry")
    .option("-t, --ticket", "Prints the ticket number")
    .action(async ({ ticket }: { ticket: boolean }) => {
        const currentTimeEntry = await toggl.getCurrentTimeEntry();
        if (!currentTimeEntry) {
            return;
        }

        if (ticket) {
            const match = /^[A-Z]+-\d+/.exec(currentTimeEntry.description);
            if (match?.length) {
                console.info(match[0]);
                return;
            }
        }

        console.info(currentTimeEntry.description);
    });

program
    .command("send <event> <payload>")
    .option(
        "-s, --socketPath <SOCKET_PATH>",
        "Optional socket path to use instead of the default one",
        DEFAULT_SERVER_SOCKET,
    )
    .action(server.sendCommand);

program.addCommand(toggl.command);
program.addCommand(logging);

program.hook("preAction", (command) => {
    const options = command.optsWithGlobals<BaseOptions>();
    if (options.verbose) {
        logger.level = "debug";
    }
});

await program.parseAsync();
