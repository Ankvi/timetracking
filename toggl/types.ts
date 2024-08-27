import type { Team } from "../types";

export type Workspace = {
	id: string;
	organization_id: string;
	name: string;
};

export type User = {
	id: string;
	email: string;
	fullname: string;
	timezone: string;
	default_workspace_id: number;
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
	// pid: number;
	project_id?: number;
	shared_with_user_ids?: number[];
	start: Date;
	// start_date: string;
	stop?: string;
	tag_action?: "add" | "delete";
	tag_ids?: number[];
	tags?: string[];
	task_id?: number;
	// tid: number;
	// uid: number;
	user_id?: number;
	// wid: number;
	workspace_id: number;
};

export type CurrentTimeEntry = {
	at: string;
	billable: boolean;
	client_name: string;
	description: string;
	duration: number;
	duronly: boolean;
	id: number;
	permissions: string[];
	pid: number;
	project_active: boolean;
	project_billable: boolean;
	project_color: string;
	project_id?: number;
	project_name: string;
	shared_with_user_ids: [number];
	start: string;
	stop?: string;
	tag_ids: [number];
	tags: [string];
	task_id?: number;
	task_name: string;
	tid: number;
	uid: number;
	user_id: number;
	user_name: string;
	wid: number;
	workspace_id: number;
};

export type Project = {
	id: number;
	name: Team;
	active: string;
	client_id: Client["id"];
};
