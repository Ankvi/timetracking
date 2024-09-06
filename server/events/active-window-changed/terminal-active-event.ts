import { logger } from "@/logging";
import { getProject } from "@/tmux/titles";
import type { TmuxPaneTitle } from "@/tmux/types";
import { startTimer } from "@/toggl";
import type { Branch, BranchType, Team } from "@/types";

type BranchInfo = {
	fullName: Branch;
	type: BranchType;
	team: Team;
	ticketNumber: number;
	name: string;
};

// Captures the branch type, team, ticket number and name of a branch
const branchTester = /^([a-z]+)\/([A-Z]+)-(\d+)-([a-zA-Z0-9-]+)$/;

function extractBranchInfo(branch: Branch): BranchInfo | null {
	const result = branchTester.exec(branch);
	if (!result) {
		logger.debug(
			"Branch did not match requirements for a toggl timer. Private project?",
		);
		return null;
	}

	const [fullName, type, team, ticketNumber, name] = result;
	return {
		fullName,
		type: type as BranchType,
		team: team as Team,
		ticketNumber: Number.parseInt(ticketNumber, 10),
		name,
	};
}

let currentBranch: Branch | null;

export async function handleTerminalActiveEvent(title: TmuxPaneTitle) {
	logger.debug("Got terminal active event");
	const { directory, branch } = getProject(title);
	logger.debug(
		`Got active window in directory: ${directory} and branch: ${branch}`,
	);
	if (!branch) {
		logger.debug("Event did not contain a branch.");
		return;
	}

	if (branch === currentBranch) {
		logger.debug("Same branch as current. Skipping");
	}

	const branchInfo = extractBranchInfo(branch);
	if (!branchInfo) {
		return;
	}

	logger.debug(branchInfo);
	const { type, team, ticketNumber, name } = branchInfo;
	await startTimer(type, team, ticketNumber, name);
}
