import type { Team } from "../types";
import { getCurrentTimeEntry, me, startTimeEntry } from "./client";
import type { CurrentTimeEntry } from "./types";

let currentTimeEntry: CurrentTimeEntry | undefined;

export async function startTimer(
	team: Team,
	ticketNumber: number,
	name: string,
) {
	const user = await me();

	const teamId = user.projects.find((project) => project.name === team);

	if (!teamId) {
		throw new Error(
			`The team '${team}' does not have a corresponding team ID in toggl`,
		);
	}

	if (!currentTimeEntry) {
		const currentEntryResponse = await getCurrentTimeEntry();
		currentTimeEntry = currentEntryResponse;
	}

	const taskName = `${team}-${ticketNumber}: name`;

	if (currentTimeEntry?.description === taskName) {
		console.info("Time entry for task already running");
		return;
	}

	if (!currentTimeEntry) {
		currentTimeEntry = await startTimeEntry(
			taskName,
			user.default_workspace_id,
		);
	}
}
