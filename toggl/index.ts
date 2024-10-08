import { type TaskType, Team } from "@/types";
import { Command } from "commander";
import type { CurrentTimeEntry } from "./types";

import { logger } from "@/logging";
import { sendCommand } from "@/server";
import { getTicket } from "../jira";
import { waitForOnlineState } from "../network";
import * as client from "./client";

let currentTimeEntry: CurrentTimeEntry | undefined;

export async function startTimer(
    type: TaskType,
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

    let ticket: string = team;
    let taskName = name;
    const tags: string[] = [type];
    if (ticketNumber > 0) {
        ticket = `${team}-${ticketNumber}`;
        try {
            const ticketInfo = await getTicket(team, ticketNumber);
            tags.push(ticketInfo.key);
            taskName = ticketInfo.fields.summary;
        } catch (error) {
            logger.warn({
                message: "unable to get ticket info from Jira",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    const description = `${ticket} ${taskName}`;

    if (
        currentTimeEntry?.description === description &&
        !currentTimeEntry.stop
    ) {
        logger.debug("Time entry for task already running");
        return;
    }

    logger.info(`Starting time entry with description: ${description}`);
    currentTimeEntry = await client.startTimeEntry(
        description,
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

    const stop = new Date();
    currentTimeEntry.stop = stop.toISOString();
    currentTimeEntry.duration = null as unknown as number;
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
        await waitForOnlineState("stopTimer");
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
    type?: TaskType;
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
            name: "meeting",
        });
    });
