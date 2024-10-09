import { logger } from "@/logging";
import axios, { HttpStatusCode } from "axios";
import type {
    Client,
    CurrentTimeEntry,
    TimeEntryRequest,
    User,
    Workspace,
} from "./types";

const BASE_URL = "https://api.track.toggl.com/api/v9";

const credentials = Buffer.from(
    `${Bun.env.TOGGL_API_TOKEN}:api_token`,
).toString("base64");

const client = axios.create({
    headers: {
        Authorization: `Basic ${credentials}`,
    },
    baseURL: BASE_URL,
});

let currentUser: User;

export async function me(): Promise<User> {
    if (currentUser) {
        return currentUser;
    }

    logger.debug("Retrieving user");

    const response = await client.get<User>("me", {
        params: {
            with_related_data: true,
        },
    });

    if (response.status !== HttpStatusCode.Ok) {
        throw new Error("Unable to retrieve user");
    }

    currentUser = response.data;
    return currentUser;
}

export async function getCurrentTimeEntry(): Promise<
    CurrentTimeEntry | undefined
> {
    try {
        const response = await client.get<CurrentTimeEntry>(
            "me/time_entries/current",
        );
        return response.data;
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

        const response = await client.post<CurrentTimeEntry>(
            `workspaces/${timeEntry.workspace_id}/time_entries`,
            timeEntry,
        );

        if (response.status !== HttpStatusCode.Ok) {
            logger.warn(
                `Start time entry request was not successful: ${response.status} - ${response.data}`,
            );
            return;
        }

        return response.data;
    } catch (error) {
        logger.warn(error);
        return;
    }
}

export async function stopTimeEntry(timeEntry: CurrentTimeEntry) {
    const response = await client.patch<CurrentTimeEntry>(
        `workspaces/${timeEntry.workspace_id}/time_entries/${timeEntry.id}/stop`,
    );

    return response.data;
}

export async function updateTimeEntry(
    timeEntry: CurrentTimeEntry,
): Promise<CurrentTimeEntry> {
    const response = await client.put<CurrentTimeEntry>(
        `workspaces/${timeEntry.workspace_id}/time_entries/${timeEntry.id}`,
        timeEntry,
    );

    if (response.status !== HttpStatusCode.Ok) {
        throw new Error(`Unable to update time entry: \n${response.data}`);
    }

    return response.data;
}

export async function workspaces(): Promise<Workspace[]> {
    const response = await client.get("me/workspaces");
    return response.data;
}

export async function clients(workspace?: string): Promise<Client[]> {
    const url = workspace ? `workspaces/${workspace}/clients` : "me/clients";

    const response = await client.get<Client[]>(url);
    return response.data;
}
