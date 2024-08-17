#!/usr/bin/env bun

import { Command } from "commander";
import * as server from "./server";
import * as tmux from "./tmux";
import * as togglClient from "./toggl/client";
import * as windowManagers from "./window-manager-sockets";

const program = new Command("timetracking");

type StartOptions = {
	manager: "hyprland" | "sway";
	terminal: string;
	socketPath: string;
};

program
	.command("start")
	.description("Start the timetracking process")
	.requiredOption(
		"-m, --manager <WINDOW_MANAGER>",
		"Window manager to connect to",
	)
	.requiredOption(
		"-t, --terminal <TERMINAL>",
		"The WM_CLASS of your used terminal, e.g. Alacritty",
	)
	.option(
		"-s, --socketPath <SOCKET_PATH>",
		"Optional socket path to use instead of the default one",
		server.DEFAULT_SERVER_SOCKET,
	)
	.action(async (args: StartOptions) => {
		windowManagers.connect(args.manager);
		tmux.connectToSocket();
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

const toggl = program.command("toggl").description("Toggl track commands");
toggl
	.command("whoami")
	.description("Print the currently active toggl track user")
	.action(() => togglClient.me().then(console.log));
toggl
	.command("current-entry")
	.description("Print the current running time entry")
	.action(() => togglClient.currentTimeEntry().then(console.log));
toggl
	.command("workspaces")
	.description("Print all workspaces available to the current account")
	.action(() => togglClient.workspaces().then(console.log));

await program.parseAsync();
