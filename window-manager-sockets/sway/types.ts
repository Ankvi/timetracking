import type { ObjectEnum } from "../../types";

export const Command = {
	run_command: 0,
	get_workspaces: 1,
	subscribe: 2,
	get_outputs: 3,
	get_tree: 4,
	get_marks: 5,
	get_bar_config: 6,
	get_version: 7,
	get_binding_modes: 8,
	get_config: 9,
	send_tick: 10,
	sync: 11,
	get_binding_state: 12,
} as const;

export type Command = ObjectEnum<typeof Command>;

export const MAGIC = "i3-ipc";
export const MAGIC_LENGTH = MAGIC.length;
export const HEADER_LENGTH = MAGIC_LENGTH + 8;

export type CommandPayloads = {
	[Command.run_command]: [];
	[Command.get_workspaces]: [];
	[Command.subscribe]: (keyof typeof IpcEvent)[];
	[Command.get_outputs]: [];
	[Command.get_tree]: [];
	[Command.get_marks]: [];
	[Command.get_bar_config]: [];
	[Command.get_version]: [];
	[Command.get_binding_modes]: [];
	[Command.get_config]: [];
	[Command.send_tick]: [];
	[Command.sync]: [];
	[Command.get_binding_state]: [];
};

export const IpcEvent = {
	workspace: 0,
	output: 1,
	mode: 2,
	window: 3,
	bar_config_update: 4,
	binding: 5,
	shutdown: 6,
	tick: 7,
} as const;

export type IpcEvent = ObjectEnum<typeof IpcEvent>;

export type MessageHeader = {
	type: IpcEvent;
	isEvent: boolean;
	payloadLength: number;
};

export interface WindowEvent {
	change: string;
	container: Container;
}

type WindowRole = "browser" | "browser-window" | "pop-up";
type WindowType = "normal";

export interface WindowProperties {
	class: string;
	instance: string;
	machine: string;
	title: string;
	transient_for: unknown;
	window_role: WindowRole;
	window_type: WindowType;
}

export type ContainerType =
	| "root"
	| "workspace"
	| "output"
	| "con"
	| "floating_con"
	| "dockarea";

export enum ContainerTypes {
	Root = "root",
	Workspace = "workspace",
	Output = "output",
	Content = "con",
	FloatingContent = "floating_con",
	DockArea = "dockarea",
}

type NodeTypesForContainerTypes = {
	[ContainerTypes.Root]: Nodes<Output, Output, never>;
	[ContainerTypes.Workspace]: Nodes<Content, Content>;
	[ContainerTypes.Output]: Nodes<Workspace, Workspace>;
	[ContainerTypes.Content]: Nodes;
	[ContainerTypes.FloatingContent]: Nodes;
	[ContainerTypes.DockArea]: Nodes;
};

export interface Nodes<
	TNode = never,
	TFloatingNode = never,
	TParent extends number | never = number,
> {
	parent: TParent;
	nodes: TNode[];
	floating_nodes: TFloatingNode[];
}

export type BaseContainer<T extends ContainerTypes> =
	NodeTypesForContainerTypes[T] & {
		id: number;
		type: T;
		orientation: string;
		scratchpad_state: string;
		percent: number;
		urgent: boolean;
		marks: string[];
		focused: boolean;
		output: string;
		layout: string;
		workspace_layout: string;
		last_split_layout: string;
		border: string;
		current_border_width: number;
		rect: Rect;
		deco_rect: Rect;
		window_rect: Rect;
		geometry: Rect;
		name: string;
		window_icon_padding: number;
		window: number;
		window_type: string;
		window_properties: WindowProperties;
		focus: number[];
		fullscreen_mode: number;
		sticky: boolean;
		floating: string;
		swallows: unknown[];
	};

export type Root = BaseContainer<ContainerTypes.Root>;
export type Workspace = BaseContainer<ContainerTypes.Workspace>;
export type Output = BaseContainer<ContainerTypes.Output> & {
	primary: boolean;
	make: string;
	model: string;
	serial: string;
	modes: OutputMode[];
	non_desktop: boolean;
	active: boolean;
	dpms: boolean;
	power: boolean;
	scale: number;
	scale_filter: string;
	transform: string;
	adaptive_sync_status: string;
	current_workspace: string;
	current_mode: OutputMode;
	max_render_time: number;
	subpixel_hinting: string;
};

type ContentProperties = {
	pid: number;
	app_id: string;
	visible: boolean;
	max_render_time: number;
	shell: string;
	inhibit_idle: boolean;
	idle_inhibitors: {
		user: string;
		application: string;
	};
};

export type Content = BaseContainer<ContainerTypes.Content> & ContentProperties;
export type FloatingContent = BaseContainer<ContainerTypes.FloatingContent> &
	ContentProperties;

export const isContent = (x: Container): x is Content | FloatingContent =>
	x.type === ContainerTypes.Content ||
	x.type === ContainerTypes.FloatingContent;

export type Container = Root | Workspace | Output | Content | FloatingContent;

export interface OutputMode {
	width: number;
	height: number;
	refresh: number;
	picture_aspect_ratio: string;
}

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}
