import type { Team } from "../types";
import { me } from "./client";

export async function startTimer(
	team: Team,
	ticketNumber: number,
	name: string,
) {
	const user = await me();

	const teamId = user.projects.find((project) => project.name === team);
}
