import type { ObjectEnum } from "../types";

export const EventNames = {
	Shutdown: "shutdown",
	StartTimeTracker: "start-time-tracker",
	GitBranchChanged: "git-branch-changed",
} as const;

export type EventNames = ObjectEnum<typeof EventNames>;

export type EventPayloads = {
	[EventNames.Shutdown]: never;
	[EventNames.StartTimeTracker]: {
		team: string;
	};
	[EventNames.GitBranchChanged]: {
		directory: string;
		branch: string;
	};
};

type BaseResponse = {
	success: boolean;
};

export async function handler<T extends keyof EventPayloads>(
	event: T,
	body: EventPayloads[T],
): Promise<BaseResponse> {
	switch (event) {
		case "shutdown": {
			process.emit("SIGINT");
			break;
		}

		case "start-time-tracker": {
			return await Promise.resolve({
				success: true,
			});
		}

		case "git-branch-changed": {
			console.log("Git branch changed");
			console.log(body);
		}
	}

	return { success: true };
}
