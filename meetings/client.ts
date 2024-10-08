import { DefaultAzureCredential } from "@azure/identity";
import type { MeetingGraphResponse } from ".";

const GRAPH_URL = "https://graph.microsoft.com";
const GRAPH_SCOPE = `${GRAPH_URL}/.default`;

const credential = new DefaultAzureCredential();

async function getUser() {
    const accessToken = await credential.getToken(GRAPH_SCOPE);

    const url = `${GRAPH_URL}/v1.0/me`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken.token}`,
        },
    });

    console.log(await response.json());
}

export async function getMeetings(start: Date, end: Date) {
    const accessToken = await credential.getToken(GRAPH_SCOPE);

    const query = new URLSearchParams({
        startdatetime: start.toISOString(),
        enddatetime: end.toISOString(),
    });

    const url = `${GRAPH_URL}/v1.0/users/andreaskv@elkjop.no/events?${query.toString()}`;
    // const url = `${GRAPH_URL}/v1.0/me/events?${query.toString()}`;
    console.log(url);

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken.token}`,
        },
    });

    const meetings = (await response.json()) as MeetingGraphResponse;

    if (meetings.error) {
        console.warn("Error while retrieving meetings");
        console.warn(meetings.error);
        return [];
    }

    return meetings.value ?? [];
}

if (import.meta.main) {
    // await getUser();
    const meetings = await getMeetings(
        new Date(2024, 9, 7),
        new Date(2024, 9, 12),
    );
    console.log(meetings);
}
