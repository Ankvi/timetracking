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
	default_workspace_id: string;
};

export type Client = {
	id: string;
	name: string;
};

export type TimeEntryRequest = {
	billable: boolean;
	created_with: string;
	description: string;
	duration: number;
	duronly: boolean;
	pid: number;
	project_id: number;
	shared_with_user_ids: [number];
	start: string;
	start_date: string;
	stop: string;
	tag_action: string;
	tag_ids: [number];
	tags: [string];
	task_id: number;
	tid: number;
	uid: number;
	user_id: number;
	wid: number;
	workspace_id: number;
};
