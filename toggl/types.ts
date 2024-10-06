import type { Team } from "../types";

export type Workspace = {
    id: number;
    organization_id: number;
    name: string;
};

export type User = {
    id: number;
    email: string;
    fullname: string;
    timezone: string;
    default_workspace_id: Workspace["id"];
    projects: Project[];
};

export type Client = {
    id: string;
    name: string;
};

export type TimeEntryRequest = {
    billable?: boolean;
    created_with: string;
    description?: string;
    duration: number;
    project_id?: Project["id"];
    shared_with_user_ids?: number[];
    start: Date;
    stop?: string;
    tag_action?: "add" | "delete";
    tag_ids?: number[];
    tags?: string[];
    workspace_id: Workspace["id"];
};

/**
 * Extra fields that will be present, but we don't really
 * care about. We'll keep track of some of them here, but
 * we won't use them.
 */
type ExtraTimeEntryFields = {
    at: string;
    billable: boolean;
    client_name: string;
    permissions: string[];
    project_active: boolean;
    project_billable: boolean;
    project_color: string;
    shared_with_user_ids: number[];
    user_id: number;
    user_name: string;
    tag_ids: number[];
};

export type CurrentTimeEntry = {
    description: string;
    duration?: number;
    id: number;
    project_id?: Project["id"];
    project_name?: string;
    start: string;
    stop?: string;
    tags: string[];
    workspace_id: Workspace["id"];
};

export type Project = {
    id: number;
    name: Team;
    active: string;
    client_id: Client["id"];
};
