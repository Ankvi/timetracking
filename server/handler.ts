import { resumeTimer, stopTimer } from "@/toggl";
import type { ObjectEnum } from "@/types";
import { $ } from "bun";
import {
	type ActiveWindowEvent,
	activeWindowEventHandler,
} from "./events/active-window-changed";

export const EventNames = {
	Shutdown: "shutdown",
	Pause: "pause",
	Resume: "resume",
	StartTimeTracker: "start-time-tracker",
	GitBranchChanged: "git-branch-changed",
	ActiveWindowChanged: "active-window-changed",
} as const;

export type EventNames = ObjectEnum<typeof EventNames>;

export type EventPayloads = {
	[EventNames.Shutdown]: never;
	[EventNames.Pause]: undefined;
	[EventNames.Resume]: undefined;
	[EventNames.StartTimeTracker]: {
		team: string;
	};
	[EventNames.ActiveWindowChanged]: ActiveWindowEvent;
};

type BaseResponse = {
	success: boolean;
};

export async function handler<T extends keyof EventPayloads>(
	event: T,
	body: EventPayloads[T],
): Promise<void> {
	try {
		switch (event) {
			case EventNames.Shutdown: {
				process.emit("SIGINT");
				break;
			}

			case EventNames.Resume: {
				await resumeTimer();
				break;
			}

			case EventNames.Pause: {
				await stopTimer();
				break;
			}

			case EventNames.ActiveWindowChanged: {
				await activeWindowEventHandler(body as ActiveWindowEvent);
				break;
			}
		}

		// return { success: true };
	} catch (error) {
		if (error instanceof Error) {
			await $`notify-send "Timetracking error" "${error.message}"`;
		}
	}
}
