import { AxiosError } from "axios";
import { parseISO } from "date-fns";
import { addTrackedTime, getTrackedTime } from "../jira";
import type { Ticket, TrackedTime } from "../jira/types";
import { getTimeEntries } from "./client";
import type { CurrentTimeEntry } from "./types";

const startDate = new Date(2024, 7, 13);
const endDate = new Date();
const timeEntries = await getTimeEntries(startDate, endDate);

const failedEntries: CurrentTimeEntry[] = [];

const existingTimeEntries: { [key: Ticket]: TrackedTime[] } = {};

for (const entry of timeEntries) {
    if (!entry.stop) {
        console.log("Entry is ongoing. Skipping");
        continue;
    }

    let ticket: Ticket | undefined;
    for (const tag of entry.tags) {
        const matched = /(?:FLASH|CID)-\d{3}/.exec(tag);
        if (matched) {
            ticket = matched.toString() as Ticket;
        }
    }
    if (!ticket) {
        continue;
    }

    if (!existingTimeEntries[ticket]) {
        const response = await getTrackedTime(ticket);
        existingTimeEntries[ticket] = response.worklogs;
    }

    if (
        existingTimeEntries[ticket].some((worklog) => {
            const content = worklog.comment?.content[0];
            if (content?.type === "paragraph") {
                if (content.content[0].text === entry.id.toString()) {
                    return true;
                }
            }
            return false;
        })
    ) {
        console.log(
            `Found existing tracked time for time entry ${entry.id}. Skipping`,
        );
        continue;
    }

    const start = parseISO(entry.start);
    const stop = parseISO(entry.stop);

    try {
        console.log(`Updating tracked time for ticket: ${ticket}`);
        const result = await addTrackedTime({
            ticket,
            start,
            stop,
            timeEntryId: entry.id,
            description: entry.description,
        });
    } catch (error) {
        console.error("Error occurred while updating ticket:", ticket);
        if (error instanceof AxiosError) {
            // console.log(error);
            console.error(error.response?.data);
            // console.error(error.toJSON());
        } else {
            console.log(error);
        }
        failedEntries.push(entry);
    }
}
