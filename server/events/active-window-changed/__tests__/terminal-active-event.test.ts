import { describe, expect, test } from "bun:test";
import { TaskType, Team } from "@/types";
import { extractBranchInfo } from "../terminal-active-event";

describe("extractBranchInfo tests", () => {
    test.each([
        [
            "feature/CID-10000-something",
            TaskType.Feature,
            Team.CustomerIdentity,
            10000,
            "something",
        ],
        [
            "CID-10000-something",
            TaskType.Other,
            Team.CustomerIdentity,
            10000,
            "something",
        ],
        ["OTHER-1-something", TaskType.Other, Team.Other, 1, "something"],
    ])(
        "%p should exact %p, %p, %p and %p",
        (branch, type, team, ticketNumber, name) => {
            const branchInfo = extractBranchInfo(branch);
            expect(branchInfo).toBeTruthy();
            expect(branchInfo).toStrictEqual({
                type,
                team,
                ticketNumber,
                name,
                fullName: branch,
            });
        },
    );
});
