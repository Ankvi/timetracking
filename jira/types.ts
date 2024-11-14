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

export type AddTrackedTimeRequest = {
    ticket: Ticket;
    timeEntryId: number;
    start: Date;
    stop: Date;
    description: string;
};

export type JiraDocText = {
    type: "text";
    text: string;
};

export type JiraDocParagraph = {
    type: "paragraph";
    content: JiraDocText[];
};

export type JiraDocContent = JiraDocText | JiraDocParagraph;

export type JiraDoc = {
    type: "doc";
    version: 1;
    content: JiraDocContent[];
};

export type TimeTrackRequest = {
    started: string;
    timeSpentSeconds: number;
    comment: JiraDoc;
};

export type TrackedTime = {
    comment: JiraDoc;
    created: string;
    id: string;
    issueId: string;
    timeSpent?: string;
    timeSpentSeconds?: number;
};

export type TrackedTimeResponse = {
    maxResults: number;
    startAt: number;
    total: number;
    worklogs: TrackedTime[];
};
