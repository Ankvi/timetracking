import type { Team } from "../types";
import { getCurrentTimeEntry, me, startTimeEntry } from "./client";

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

	const currentTimeEntry = await getCurrentTimeEntry();

	const taskName = `${team}-${ticketNumber}: name`;

	if (!currentTimeEntry) {
		return await startTimeEntry(taskName, user.default_workspace_id);
	}
}
