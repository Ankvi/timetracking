import { logger } from "@/logging";
import { resumeTimer, setStopTimestamp, startTimer, stopTimer } from "@/toggl";
import type { ObjectEnum } from "@/types";
import { $ } from "bun";
import {
    type ActiveWindowEvent,
    activeWindowEventHandler,
} from "./events/active-window-changed";
import type { StartTimeTrackerEvent } from "./events/start-time-tracker";

export const EventNames = {
    Shutdown: "shutdown",
    Pause: "pause",
    Resume: "resume",
    BeforeSleep: "before-sleep",
    AfterAwake: "after-awake",
    StartTimeTracker: "start-time-tracker",
    GitBranchChanged: "git-branch-changed",
    ActiveWindowChanged: "active-window-changed",
} as const;

export type EventNames = ObjectEnum<typeof EventNames>;

export type EventPayloads = {
    [EventNames.Shutdown]: undefined;
    [EventNames.Pause]: undefined;
    [EventNames.Resume]: undefined;
    [EventNames.BeforeSleep]: undefined;
    [EventNames.AfterAwake]: undefined;
    [EventNames.StartTimeTracker]: StartTimeTrackerEvent;
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

            case EventNames.BeforeSleep: {
                setStopTimestamp();
                break;
            }

            case EventNames.AfterAwake: {
                await stopTimer(true);
                break;
            }

            case EventNames.ActiveWindowChanged: {
                await activeWindowEventHandler(body as ActiveWindowEvent);
                break;
            }

            case EventNames.StartTimeTracker: {
                const { type, team, number } = body as StartTimeTrackerEvent;
                await startTimer(type, team, number);
            }
        }

        // return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            logger.warn(error);
            await $`notify-send "Timetracking error" "${error.message}"`;
        }
    }
}
