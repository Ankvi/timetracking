#!/usr/bin/env bun

import { Command } from "commander";
import { logger } from "./logging";
import * as server from "./server";
import * as tmux from "./tmux";
import * as toggl from "./toggl";
import * as windowManagers from "./window-manager-sockets";
import type { WindowManager } from "./window-manager-sockets/types";

const program = new Command("timetracking");

type BaseOptions = {
	verbose?: boolean;
};

program.option("-v, --verbose");

type StartOptions = {
	manager: WindowManager;
	socketPath: string;
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
		server.DEFAULT_SERVER_SOCKET,
	)
	.action(async (args: StartOptions) => {
		const serverSocket = await server.start({ socketPath: args.socketPath });

		const wmSocket = await windowManagers.connect(args.manager);

		// const tmuxProcess = tmux.start();

		async function cleanup() {
			await toggl.stopTimer();
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

program
	.command("send <event> <payload>")
	.option(
		"-s, --socketPath <SOCKET_PATH>",
		"Optional socket path to use instead of the default one",
		server.DEFAULT_SERVER_SOCKET,
	)
	.action(server.sendCommand);

program.addCommand(toggl.command);

program.hook("preAction", (command) => {
	const options = command.optsWithGlobals<BaseOptions>();
	if (options.verbose) {
		logger.level = "debug";
	}
});

await program.parseAsync();
