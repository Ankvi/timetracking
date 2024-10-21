import {
    type Mock,
    afterEach,
    beforeEach,
    describe,
    expect,
    mock,
    test,
} from "bun:test";
import * as toggl from "..";
import type * as jira from "../../jira";
import type { TicketInfo } from "../../jira/types";
import type * as client from "../client";
import type { CurrentTimeEntry, Project, User, Workspace } from "../types";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Module = Record<string, (...args: any[]) => any>;
type Mocked<T extends Module> = { [F in keyof T]: Mock<T[F]> };

type Jira = typeof jira;
type Client = typeof client;

const workspace: Workspace = {
    id: 1,
    name: "workspace",
    organization_id: 1,
};

const project: Project = {
    id: 1,
    name: "OTHER",
    active: "yes?",
    client_id: "some-client-id",
};

const user: User = {
    default_workspace_id: 1,
    id: 1,
    email: "someperson@example.com",
    fullname: "Some Person",
    projects: [project],
    timezone: "Europe/Oslo",
};

const timeEntry: CurrentTimeEntry = {
    id: 1,
    description: "OTHER-1337 something",
    start: new Date().toISOString(),
    duration: -1,
    workspace_id: workspace.id,
    project_id: project.id,
    project_name: project.name,
    tags: ["OTHER-1337", "feature"],
};

const mockedClient: Mocked<Client> = {
    me: mock(() => Promise.resolve(user)),
    startTimeEntry: mock(),
    clients: mock(),
    workspaces: mock(),
    stopTimeEntry: mock(),
    updateTimeEntry: mock(),
    getCurrentTimeEntry: mock(),
    getTimeEntries: mock(),
};

const mockedJira: Mocked<Jira> = {
    getTicket: mock(() =>
        Promise.resolve<TicketInfo>({
            id: "id",
            issueType: {
                name: "Epic",
            },
            key: "OTHER-1337",
            self: "self?",
            fields: {
                summary: "something",
                description: "description",
            },
        }),
    ),
    addTrackedTime: mock(),
};

describe("Toggl tests", () => {
    beforeEach(() => {
        mock.module("../../jira", () => mockedJira);
        mock.module("../client", () => mockedClient);
    });

    test("Starting an initial timer", async () => {
        await toggl.startTimer("feature", "OTHER", 1337, "something");

        expect(mockedJira.getTicket).toHaveBeenCalledTimes(1);
        expect(mockedClient.me).toHaveBeenCalledTimes(1);
        expect(mockedClient.getCurrentTimeEntry).toHaveBeenCalledTimes(1);
    });
});
