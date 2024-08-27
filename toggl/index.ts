import { Command } from "commander";
import type { Team } from "../types";
import type { CurrentTimeEntry } from "./types";

import * as client from "./client";

let currentTimeEntry: CurrentTimeEntry | undefined;

export async function startTimer(
	team: Team,
	ticketNumber: number,
	name: string,
) {
	const user = await client.me();

	const teamId = user.projects.find((project) => project.name === team);

	if (!teamId) {
		throw new Error(
			`The team '${team}' does not have a corresponding team ID in toggl`,
		);
	}

	if (!currentTimeEntry) {
		const currentEntryResponse = await client.getCurrentTimeEntry();
		currentTimeEntry = currentEntryResponse;
	}

	const taskName = `${team}-${ticketNumber}: ${name}`;

	if (currentTimeEntry?.description === taskName) {
		console.info("Time entry for task already running");
		return;
	}

	if (!currentTimeEntry) {
		console.log(`Starting time entry with description: ${taskName}`);
		currentTimeEntry = await client.startTimeEntry(
			taskName,
			user.default_workspace_id,
		);
	}
}

async function stopTimer() {
	if (!currentTimeEntry) {
		console.debug("No timers to stop");
		return;
	}

	console.debug("Stopping active toggl timer");
	await client.stopTimeEntry(currentTimeEntry);
	currentTimeEntry = undefined;
}

export function initialize() {
	process.on("SIGINT", stopTimer);
	process.on("SIGTERM", stopTimer);
}

export const command = new Command("toggl");
command
	.command("whoami")
	.description("Print the currently active toggl track user")
	.action(() => client.me().then(console.log));
command
	.command("current-entry")
	.description("Print the current running time entry")
	.action(() => client.getCurrentTimeEntry().then(console.log));
command
	.command("workspaces")
	.description("Print all workspaces available to the current account")
	.action(() => client.workspaces().then(console.log));
