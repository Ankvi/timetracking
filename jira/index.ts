import type { Team } from "../types";
import type { Ticket } from "./types";

const BASE_URL = "https://elkjop.atlassian.net/rest/api/3";

const credentials = Buffer.from(
    `andreas.kvist@elkjop.no:${process.env.JIRA_TOKEN}`,
).toString("base64");

const headers = new Headers({
    Authorization: `Basic ${credentials}`,
    Accept: "application/json",
});

const ticketCache = new Map<{ team: Team; number: number }, Ticket>();

export async function getTicket(team: Team, number: number): Promise<Ticket> {
    let ticket = ticketCache.get({ team, number });
    if (ticket) {
        return ticket;
    }

    const response = await fetch(`${BASE_URL}/issue/${team}-${number}`, {
        headers,
    });

    ticket = (await response.json()) as Ticket;
    ticketCache.set({ team, number }, ticket);
    return ticket;
}
