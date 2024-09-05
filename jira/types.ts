import type { Team } from "../types";

type TicketFields = {
	description: string;
	summary: string;
};

export type Ticket = {
	key: `${Team}-${number}`;
	id: string;
	// URL to ticket;
	self: string;

	fields: TicketFields;
};
