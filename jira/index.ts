import axios from "axios";
import { differenceInSeconds } from "date-fns";
import type { Team } from "../types";
import type { Ticket, TicketInfo, TimeTrackRequest } from "./types";

const BASE_URL = "https://elkjop.atlassian.net/rest/api/3";

const credentials = Buffer.from(
    `andreas.kvist@elkjop.no:${process.env.JIRA_TOKEN}`,
).toString("base64");

const headers = new Headers({
    Authorization: `Basic ${credentials}`,
    Accept: "application/json",
});

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

export async function addTrackedTime(ticket: Ticket, start: Date, end: Date) {
    const seconds = differenceInSeconds(end, start);

    const body: TimeTrackRequest = {
        started: start.toISOString(),
        timeSpentSeconds: seconds,
    };

    await client.post(`issue/${ticket}/worklog`, body);
}
