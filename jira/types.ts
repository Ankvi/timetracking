import type { Team } from "../types";

type TicketFields = {
    description: string;
    summary: string;
};

export type Ticket = `${Team}-${number}`;
export type TicketType = {
    name: "Epic" | "Story" | "Bug" | "Task" | "Sub-task";
};

export type TicketInfo = {
    key: Ticket;
    id: string;
    // URL to ticket;
    self: string;
    issueType: TicketType;

    fields: TicketFields;
    parent?: TicketInfo;
};

export type TimeTrackRequest = {
    started: string;
    timeSpentSeconds: number;
};
