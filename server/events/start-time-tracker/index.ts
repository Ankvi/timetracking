import type { TaskType, Team } from "@/types";

export type StartTimeTrackerEvent = {
    type: TaskType;
    team: Team;
    number: number;
    name?: string;
};
