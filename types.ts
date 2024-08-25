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
} as const;

export type BranchType = ObjectEnum<typeof BranchType>;

export const Team = {
	CustomerIdentity: "CID",
	Flash: "FLASH",
	ITDS: "ITDS",
} as const;

export type Team = ObjectEnum<typeof Team>;
