import { AxiosError } from "axios";
import { subMonths } from "date-fns";
import { getTimeEntries, updateTimeEntry } from "./client";

async function primeTimeEntryTags() {
    const timeEntries = await getTimeEntries(subMonths(new Date(), 2));

    for (const entry of timeEntries) {
        const ticket = /(?:FLASH|CID)-\d{3}/.exec(entry.description);
        if (!ticket) {
            console.log(
                "Could not extract ticket from description:",
                entry.description,
            );
            continue;
        }
        const ticketTag = entry.tags.find((x) => x === ticket[0]);
        if (ticketTag) {
            continue;
        }
        console.log(
            `Ticket: ${entry.id} does NOT have tag ${ticket}. Found: ${entry.tags.toString()}`,
        );
        entry.tags.push(ticket.toString());
        entry.tag_ids = undefined;
        try {
            const result = await updateTimeEntry(entry);

            console.log(`Time entry ${result.id} has been updated`);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(`Time entry update failed: ${error.message}`);
            }
        }
    }
}

if (import.meta.main) {
    await primeTimeEntryTags();
}
