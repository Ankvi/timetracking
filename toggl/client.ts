import { logger } from "@/logging";
import type {
	Client,
	CurrentTimeEntry,
	TimeEntryRequest,
	User,
	Workspace,
} from "./types";

const BASE_URL = "https://api.track.toggl.com/api";
const ME_URL = `${BASE_URL}/v9/me`;
const WORKSPACES_URL = `${BASE_URL}/v9/workspaces`;

const credentials = Buffer.from(
	`${Bun.env.TOGGL_API_TOKEN}:api_token`,
).toString("base64");

const headers = {
	Authorization: `Basic ${credentials}`,
};

let currentUser: User;

export async function me(): Promise<User> {
	if (currentUser) {
		return currentUser;
	}

	logger.debug("Retrieving user");

	const response = await fetch(`${ME_URL}?with_related_data=true`, {
		headers,
	});

	if (!response.ok) {
		throw new Error("Unable to retrieve user");
	}

	currentUser = (await response.json()) as User;

	console.log(currentUser);

	return currentUser;
}

export async function getCurrentTimeEntry(): Promise<
	CurrentTimeEntry | undefined
> {
	try {
		const response = await fetch(`${ME_URL}/time_entries/current`, {
			headers,
		});

		const json = await response.json();
		return json as CurrentTimeEntry;
	} catch (error) {
		logger.warn(error);
		return;
	}
}

export async function startTimeEntry(
	description: string,
	projectId?: number,
	workspaceId?: number,
	tags?: string[],
): Promise<CurrentTimeEntry | undefined> {
	try {
		const timeEntry: TimeEntryRequest = {
			workspace_id: workspaceId ?? (await me()).default_workspace_id,
			project_id: projectId,
			description,
			created_with: "timetracking",
			duration: -1,
			start: new Date(),
			tags,
		};

		if (!timeEntry.workspace_id) {
			throw new Error("Cannot start time entry without a workspace");
		}

		const url = `${WORKSPACES_URL}/${timeEntry.workspace_id}/time_entries`;
		logger.debug(`Starting time entry at url ${url}`);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				...headers,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(timeEntry),
		});

		if (!response.ok) {
			logger.warn(
				`Start time entry request was not successful: ${response.status} - ${await response.text()}`,
			);
			return;
		}

		return (await response.json()) as CurrentTimeEntry;
	} catch (error) {
		logger.warn(error);
		return;
	}
}

export async function stopTimeEntry(timeEntry: CurrentTimeEntry) {
	const response = await fetch(
		`${WORKSPACES_URL}/${timeEntry.workspace_id}/time_entries/${timeEntry.id}/stop`,
		{
			method: "PATCH",
			headers,
		},
	);

	return (await response.json()) as CurrentTimeEntry;
}

export async function updateTimeEntry(timeEntry: CurrentTimeEntry) {
	const response = await fetch(
		`${WORKSPACES_URL}/${timeEntry.workspace_id}/time_entries/${timeEntry.id}`,
		{
			method: "PUT",
			headers,
			body: JSON.stringify(timeEntry),
		},
	);

	if (!response.ok) {
		throw new Error(`Unable to update time entry: \n${await response.text()}`);
	}

	return (await response.json()) as CurrentTimeEntry;
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
