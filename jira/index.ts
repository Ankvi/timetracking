import axios from "axios";
import {
    differenceInSeconds,
    format,
    formatISO,
    formatISO9075,
} from "date-fns";
import type { Team } from "../types";
import type {
    AddTrackedTimeRequest,
    Ticket,
    TicketInfo,
    TimeTrackRequest,
    TrackedTimeResponse,
} from "./types";

const BASE_URL = "https://elkjop.atlassian.net/rest/api/3";

const credentials = Buffer.from(
    `andreas.kvist@elkjop.no:${process.env.JIRA_TOKEN}`,
).toString("base64");

const client = axios.create({
    headers: {
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
    },
    baseURL: BASE_URL,
});

const ticketCache = new Map<{ team: Team; number: number }, TicketInfo>();

export async function getTicket(
    team: Team,
    number: number,
): Promise<TicketInfo> {
    let ticket = ticketCache.get({ team, number });
    if (ticket) {
        return ticket;
    }

    const response = await client.get<TicketInfo>(`issue/${team}-${number}`);

    ticket = response.data;
    ticketCache.set({ team, number }, ticket);
    return ticket;
}

export async function getTrackedTime(
    ticket: Ticket,
): Promise<TrackedTimeResponse> {
    const response = await client.get<TrackedTimeResponse>(
        `issue/${ticket}/worklog`,
    );
    return response.data;
}

export async function addTrackedTime({
    ticket,
    timeEntryId,
    description,
    start,
    stop,
}: AddTrackedTimeRequest) {
    const seconds = differenceInSeconds(stop, start);

    if (!seconds) {
        return;
    }

    const body: TimeTrackRequest = {
        started: format(start, "yyyy-MM-dd'T'HH:mm:ss.SSSxxxx"),
        timeSpentSeconds: seconds,
        comment: {
            type: "doc",
            version: 1,
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: timeEntryId.toString(),
                        },
                        {
                            type: "text",
                            text: description,
                        },
                    ],
                },
            ],
        },
    };
    // console.log(body);

    await client.post(`issue/${ticket}/worklog`, body);
}
