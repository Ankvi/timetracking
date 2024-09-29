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

if (import.meta.main) {
	await getNetworkConnections();
}