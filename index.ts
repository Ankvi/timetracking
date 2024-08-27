#!/usr/bin/env bun

import { Command } from "commander";
import * as server from "./server";
import * as tmux from "./tmux";
import * as toggl from "./toggl";
import * as windowManagers from "./window-manager-sockets";
import type { WindowManager } from "./window-manager-sockets/types";

const program = new Command("timetracking");

type StartOptions = {
	manager: WindowManager;
	// terminal: string;
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
	// .requiredOption(
	// 	"-t, --terminal <TERMINAL>",
	// 	"The WM_CLASS of your used terminal, e.g. Alacritty",
	// )
	.option(
		"-s, --socketPath <SOCKET_PATH>",
		"Optional socket path to use instead of the default one",
		server.DEFAULT_SERVER_SOCKET,
	)
	.action(async (args: StartOptions) => {
		// process.env.TERMINAL = args.terminal;

		windowManagers.connect(args.manager);
		toggl.initialize();
		// tmux.start();
		server.start({ socketPath: args.socketPath });
	});

program
	.command("send")
	.argument("<data>")
	.option(
		"-s, --socketPath <SOCKET_PATH>",
		"Optional socket path to use instead of the default one",
		server.DEFAULT_SERVER_SOCKET,
	)
	.action(server.sendCommand);

program.addCommand(toggl.command);

await program.parseAsync();
