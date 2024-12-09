import { logger } from "@/logging";
import { getProject } from "@/tmux/titles";
import type { TmuxPaneTitle } from "@/tmux/types";
import { startTimer } from "@/toggl";
import { type Branch, TaskType, Team, Teams } from "@/types";

type BranchInfo = {
    fullName: Branch;
    type: TaskType;
    team: Team;
    ticketNumber: number;
    name: string;
};

// Captures the branch type, team, ticket number and name of a branch
const branchTester = /^(?:([a-z]+)\/)?([A-Z]+)-(\d+)(?:-(.+))*$/;

const mainBranches = ["main", "master", "develop"];

function getTeamOfDirectory(directory: string): Team {
    if (directory.includes("CID")) {
        return Team.CustomerIdentity;
    }

    return Team.Flash;
}

export function extractBranchInfo(
    directory: string,
    branch: Branch,
): BranchInfo | null {
    if (!directory.includes("github.com/elkjopnordic")) {
        return {
            fullName: directory,
            name: directory,
            type: TaskType.Other,
            ticketNumber: 0,
            team: Team.Other,
        };
    }

    if (mainBranches.includes(branch)) {
        return {
            fullName: directory,
            name: directory,
            type: TaskType.Other,
            ticketNumber: 0,
            team: getTeamOfDirectory(directory),
        };
    }

    const result = branchTester.exec(branch);
    if (!result) {
        logger.debug("Branch did not match requirements for a toggl timer.");
        return null;
    }

    const [fullName, type, team, ticketNumber, name] = result;

    return {
        fullName,
        type: (type as TaskType) ?? TaskType.Other,
        team: (team as Team) ?? Team.Other,
        ticketNumber: Number.parseInt(ticketNumber, 10),
        name: name ?? "Unknown",
    };
}

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

    const branchInfo = extractBranchInfo(directory, branch);
    if (!branchInfo) {
        return;
    }

    logger.debug(branchInfo);
    const { type, team, ticketNumber, name } = branchInfo;
    await startTimer(type, team, ticketNumber, name);
}
