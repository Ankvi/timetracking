import { Command } from "commander";
import type { BranchType, Team } from "../types";
import type { CurrentTimeEntry } from "./types";

import { logger } from "../logging";
import * as client from "./client";

let currentTimeEntry: CurrentTimeEntry | undefined;

export async function startTimer(
	type: BranchType,
	team: Team,
	ticketNumber: number,
	name: string,
) {
	const user = await client.me();

	const project = user.projects.find((project) => project.name === team);

	if (!project) {
		throw new Error(
			`The team '${team}' does not have a corresponding team ID in toggl`,
		);
	}

	if (!currentTimeEntry) {
		currentTimeEntry = await client.getCurrentTimeEntry();
	}

	const taskName = `${type}(${team}-${ticketNumber}): ${name}`;

	if (currentTimeEntry?.description === taskName && !currentTimeEntry.stop) {
		logger.info("Time entry for task already running");
		return;
	}

	logger.info(`Starting time entry with description: ${taskName}`);
	currentTimeEntry = await client.startTimeEntry(
		taskName,
		project.id,
		user.default_workspace_id,
	);
}

export async function resumeTimer() {
	if (!currentTimeEntry) {
		logger.debug("No timer to resume");
		return;
	}

	if (!currentTimeEntry.stop) {
		logger.debug("Timer is already running for the current entry");
		return;
	}

	currentTimeEntry = await client.startTimeEntry(
		currentTimeEntry.description,
		currentTimeEntry.project_id,
		currentTimeEntry.workspace_id,
	);
}

export async function stopTimer() {
	if (!currentTimeEntry) {
		logger.debug("No timers to stop");
		return;
	}

	if (currentTimeEntry.stop) {
		logger.debug("Timer already stopped");
		return;
	}

	logger.debug("Stopping active toggl timer");
	currentTimeEntry = await client.stopTimeEntry(currentTimeEntry);
}

export function initialize() {
	process.on("SIGINT", stopTimer);
	process.on("SIGTERM", stopTimer);
}

export const command = new Command("toggl");
command
	.command("whoami")
	.description("Print the currently active toggl track user")
	.action(async () => {
		const me = await client.me();
		logger.info(me);
	});
command
	.command("current-entry")
	.description("Print the current running time entry")
	.action(async () => {
		const currentTimeEntry = await client.getCurrentTimeEntry();
		logger.info(currentTimeEntry);
	});
command
	.command("workspaces")
	.description("Print all workspaces available to the current account")
	.action(async () => {
		const workspaces = await client.workspaces();
		logger.info(workspaces);
	});
