export type ObjectEnum<T> = T[keyof T];

export type Branch = string;
export type Directory = string;

export type Project = {
	directory: Directory;
	branch: Branch;
};

export const BranchType = {
	Feature: "feature",
	Bug: "bug",
	Hotfix: "hotfix",
	Cleanup: "cleanup",
	Improvement: "improvement",
	Other: "other",
} as const;

export type BranchType = ObjectEnum<typeof BranchType>;

export const Team = {
	CustomerIdentity: "CID",
	Flash: "FLASH",
	ITDS: "ITDS",
	Other: "OTHER",
} as const;

export type Team = ObjectEnum<typeof Team>;

export class ServerNotRunningError extends Error {}
