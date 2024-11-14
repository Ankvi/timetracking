import { differenceInMinutes, differenceInSeconds, format } from "date-fns";
import type { Ticket } from "../jira/types";
import { getTimeEntries } from "./client";

const startDate = new Date(2024, 7, 13);
const endDate = new Date();

const timeEntries = await getTimeEntries(startDate, endDate);
console.log(JSON.stringify(timeEntries, null, 4));

type TimeSpentPerDay = { [key: string]: number };
type TicketTimeSpentReport = { [key: Ticket]: TimeSpentPerDay };

const report: TicketTimeSpentReport = {};

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

    if (!report[ticket]) {
        report[ticket] = {};
    }

    if (!report[ticket][entry.start]) {
        report[ticket][entry.start] = 0;
    }

    // const durationInMinutes = differenceInMinutes(entry.stop, entry.start);
    // report[ticket][entry.start] += durationInMinutes;
    const durationInSeconds = differenceInSeconds(entry.stop, entry.start);
    report[ticket][entry.start] += durationInSeconds;
}

for (const [ticket, timeSpent] of Object.entries(report)) {
    console.log(`======= TICKET: ${ticket} =======`);
    for (const [date, minutes] of Object.entries(timeSpent)) {
        console.log(`${date}: ${minutes} minutes`);
    }
}

await Bun.write(
    `${import.meta.dir}/reports/timespent.json`,
    JSON.stringify(report, null, 4),
);
