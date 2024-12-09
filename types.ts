export type ObjectEnum<T> = T[keyof T];

export type Branch = string;
export type Directory = string;

export type Project = {
    directory: Directory;
    branch: Branch;
};

export const TaskType = {
    Feature: "feature",
    Bug: "bug",
    Hotfix: "hotfix",
    Cleanup: "cleanup",
    Improvement: "improvement",
    Other: "other",
} as const;

export type TaskType = ObjectEnum<typeof TaskType>;

export const Team = {
    CustomerIdentity: "CID",
    Flash: "FLASH",
    ITDS: "ITDS",
    Other: "OTHER",
} as const;

export const Teams = Object.values(Team);

export type Team = ObjectEnum<typeof Team>;

export class ServerNotRunningError extends Error {}
