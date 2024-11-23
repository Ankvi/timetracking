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
            const branchInfo = extractBranchInfo(
                "/home/USER/git/github.com/elkjopnordic/CID/App1",
                branch,
            );
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

    test.each([
        ["/home/USER/git/github.com/elkjopnordic/CID/App1", "develop"],
        ["/home/USER/git/github.com/elkjopnordic/CID/App2", "main"],
    ])(
        "Working in the a main branch of anything in the CID folder should start an OTHER task of CID",
        (directory, branch) => {
            const branchInfo = extractBranchInfo(directory, branch);
            expect(branchInfo).toStrictEqual({
                team: Team.CustomerIdentity,
                ticketNumber: 0,
                type: TaskType.Other,
                fullName: directory,
                name: directory,
            });
        },
    );

    test.each([
        ["/home/USER/git/github.com/Ankvi/CID/App1", "develop"],
        ["/home/USER/git/github.com/Ankvi/dotfiles", "main"],
        ["/home/USER/git/github.com/Ankvi/timetracking", "some-feature"],
    ])(
        "Working in a branch of anything not in the elkjopnordic folder should start a private OTHER task",
        (directory, branch) => {
            const branchInfo = extractBranchInfo(directory, branch);
            expect(branchInfo).toStrictEqual({
                team: Team.Other,
                ticketNumber: 0,
                type: TaskType.Other,
                fullName: directory,
                name: directory,
            });
        },
    );
});
