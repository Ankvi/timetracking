import { Command } from "commander";
import * as tmux from "./tmux";
import * as togglClient from "./toggl/client";
import * as windowManagers from "./window-manager-sockets";

const program = new Command();

program.command("start").action(async () => {
	windowManagers.connect("hyprland");
	tmux.connectToSocket();
});

const toggl = program.command("toggl");
toggl.command("whoami").action(togglClient.me);
toggl.command("current-entry").action(togglClient.currentTimeEntry);

await program.parseAsync();
