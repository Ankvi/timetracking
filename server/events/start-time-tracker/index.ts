import type { BranchType, Team } from "@/types";

export type StartTimeTrackerEvent = {
    type: BranchType;
    team: Team;
    number: number;
    name?: string;
};
