import type { Team } from "../types";

type TicketFields = {
    description: string;
    summary: string;
};

export type Ticket = `${Team}-${number}`;

export type TicketInfo = {
    key: Ticket;
    id: string;
    // URL to ticket;
    self: string;

    fields: TicketFields;
};

export type TimeTrackRequest = {
    started: string;
    timeSpentSeconds: number;
};
