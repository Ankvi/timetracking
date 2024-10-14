import { $ } from "bun";
import { logger } from "./logging";

type EnableState = "enabled" | "disabled" | "missing";

type NmcliConnection = {
    STATE: "connected" | "connected (local only)" | "asleep" | "disconnected";
    CONNECTIVITY: "full" | "none";
    "WIFI-HW": EnableState;
    WIFI: EnableState;
    "WWAN-HW": EnableState;
    WWAN: EnableState;
    METERED: "yes (guessed)" | "unknown";
};

export async function getNetworkConnections() {
    const result = await $`nmcli general status`.text();
    const [header, ...connections] = result.trim().split("\n");

    if (!connections?.length) {
        throw new Error("No connections found in nmcli result");
    }

    const headerFieldNames = header.split(" ").filter((entry) => entry !== "");
    if (!headerFieldNames?.length) {
        throw new Error("Could not extract any header lines");
    }

    const output: NmcliConnection[] = [];
    for (const line of connections) {
        const lineValues = line
            .split("  ")
            .map((entry) => entry.trim())
            .filter((entry) => entry !== "");

        if (!lineValues?.length) {
            logger.warn("Could not parse line in nmcli result", lineValues);
            continue;
        }

        const entry: Record<string, string> = {};
        for (let i = 0; i < headerFieldNames.length; i++) {
            entry[headerFieldNames[i]] = lineValues[i];
        }

        output.push(entry as NmcliConnection);
    }
    return output;
}

export async function isOnline() {
    const connections = await getNetworkConnections();
    return connections.some((connection) => connection.CONNECTIVITY === "full");
}

export async function waitForOnlineState(operation: string): Promise<true> {
    let retries = 0;
    let online = false;
    while (retries < 5) {
        online = await isOnline();
        if (online) {
            break;
        }

        logger.debug("Device is offline. Retrying");

        retries++;

        await Bun.sleep(2000);
    }

    if (!online) {
        throw new Error(
            `Unable to perform operation '${operation}' as device is offline`,
        );
    }

    return online;
}

// TODO: Use `nmcli monitor` to keep a state instead of prompting?

// export async function fetchWithRetry()

if (import.meta.main) {
    await getNetworkConnections();
}
