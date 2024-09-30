import { describe, mock, test } from "bun:test";
import * as toggl from "..";
import type { User } from "../types";

const user: User = {
	default_workspace_id: 1,
	id: "some-id",
	email: "someperson@example.com",
	fullname: "Some Person",
	projects: [
		{
			id: 1,
			name: "OTHER",
			active: "yes?",
			client_id: "some-client-id",
		},
	],
	timezone: "Europe/Oslo",
};

mock.module("../client", () => ({
	me: () => Promise.resolve(user),
}));

describe("Toggl tests", () => {});
