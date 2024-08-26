import type { Team } from "../types";
import { getCurrentTimeEntry, me } from "./client";

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

	if (!currentTimeEntry) {
	}
}
