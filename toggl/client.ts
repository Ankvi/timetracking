import type { Client, CurrentTimeEntry, User, Workspace } from "./types";

const BASE_URL = "https://api.track.toggl.com/api";
const ME_URL = `${BASE_URL}/v9/me`;
const WORKSPACES_URL = `${BASE_URL}/workspaces`;

const credentials = Buffer.from(
	`${Bun.env.TOGGL_API_TOKEN}:api_token`,
).toString("base64");

const headers = {
	Authorization: `Basic ${credentials}`,
};

let currentUser: Promise<User>;

export async function me(): Promise<User> {
	if (currentUser) {
		return currentUser;
	}

	currentUser = fetch(ME_URL, {
		headers,
	}).then((response) => response.json()) as Promise<User>;

	return await currentUser;
}

export async function currentTimeEntry(): Promise<CurrentTimeEntry> {
	const response = await fetch(`${ME_URL}/time_entries/current`, {
		headers,
	});

	const json = await response.json();
	return json as CurrentTimeEntry;
}

export async function workspaces(): Promise<Workspace[]> {
	const response = await fetch(`${ME_URL}/workspaces`, {
		headers,
	});

	const json = await response.json();
	return json as Workspace[];
}

export async function clients(workspace?: string): Promise<Client[]> {
	const url = workspace
		? `${WORKSPACES_URL}/workspaces/${workspace}/clients`
		: `${ME_URL}/clients`;
	const response = await fetch(url, {
		headers,
	});

	return (await response.json()) as Client[];
}
