import { type BranchType, Team } from "@/types";
import { Command } from "commander";
import type { CurrentTimeEntry } from "./types";

import { logger } from "@/logging";
import { sendCommand } from "@/server";
import { getTicket } from "../jira";
import { isOnline } from "../network";
import * as client from "./client";

let currentTimeEntry: CurrentTimeEntry | undefined;

export async function startTimer(
	type: BranchType,
	team: Team,
	ticketNumber: number,
	name = "unknown",
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

	let taskName = name;
	const tags: string[] = [type];
	if (ticketNumber > 0) {
		const ticketInfo = await getTicket(team, ticketNumber);
		taskName = `${ticketInfo.key} ${ticketInfo.fields.summary}`;
		tags.push(ticketInfo.key);
	}

	if (currentTimeEntry?.description === taskName && !currentTimeEntry.stop) {
		logger.debug("Time entry for task already running");
		return;
	}

	logger.info(`Starting time entry with description: ${taskName}`);
	currentTimeEntry = await client.startTimeEntry(
		taskName,
		project.id,
		user.default_workspace_id,
		tags,
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
		currentTimeEntry.tags,
	);
}

export function setStopTimestamp() {
	if (!currentTimeEntry) {
		logger.debug("No timers running");
		return;
	}

	if (currentTimeEntry.stop) {
		logger.debug("Timer already stopped");
		return;
	}

	currentTimeEntry.stop = new Date().toISOString();
}

export async function stopTimer(checkOnlineStatus = false) {
	if (!currentTimeEntry) {
		logger.debug("No timers running");
		return;
	}

	if (!currentTimeEntry.stop) {
		setStopTimestamp();
	}

	logger.debug("Stopping active toggl timer");

	if (checkOnlineStatus) {
		let retries = 0;
		let online = false;
		while (retries < 5) {
			online = await isOnline();
			if (online) {
				break;
			}

			logger.debug("Device is offline. Retrying");

			retries++;

			await Bun.sleep(1000);
		}

		if (!online) {
			logger.warn("Unable to stop timer as device is offline");
			return;
		}
	}

	currentTimeEntry = await client.updateTimeEntry(currentTimeEntry);
}

export async function getCurrentTimeEntry(): Promise<
	CurrentTimeEntry | undefined
> {
	if (currentTimeEntry) {
		return currentTimeEntry;
	}

	currentTimeEntry = await client.getCurrentTimeEntry();

	return currentTimeEntry;
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
		const currentTimeEntry = await getCurrentTimeEntry();
		logger.info(currentTimeEntry);
	});
command
	.command("workspaces")
	.description("Print all workspaces available to the current account")
	.action(async () => {
		const workspaces = await client.workspaces();
		logger.info(workspaces);
	});

type StartOptions = {
	type?: BranchType;
};

command
	.command("start <TICKET_NO>")
	.option("-t, --type <TYPE>")
	.action(async (ticket: `${Team}-${number}`, { type }: StartOptions) => {
		const [team, ticketNumber] = ticket.split("-") as [Team, string];
		if (!Object.values(Team).includes(team)) {
			throw new Error(`Team ${team} does not exist`);
		}

		const parsedTicketNumber = Number.parseInt(ticketNumber, 10);
		if (!parsedTicketNumber) {
			throw new Error(`Could not parse ticket number ${ticketNumber}`);
		}

		await sendCommand("start-time-tracker", {
			type: type ?? "other",
			team,
			number: parsedTicketNumber,
		});
	});
