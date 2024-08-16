import { Command } from "commander";
import * as tmux from "./tmux";
import * as togglClient from "./toggl/client";
import * as windowManagers from "./window-manager-sockets";

const program = new Command();

type StartOptions = {
	manager: "hyprland" | "sway";
};

program
	.command("start")
	.requiredOption(
		"-m, --manager <WINDOW_MANAGER>",
		"Window manager to connect to",
	)
	.action(async (args: StartOptions) => {
		windowManagers.connect(args.manager);
		tmux.connectToSocket();
	});

const toggl = program.command("toggl");
toggl.command("whoami").action(togglClient.me);
toggl.command("current-entry").action(togglClient.currentTimeEntry);
toggl.command("workspaces").action(togglClient.workspaces);

await program.parseAsync();
