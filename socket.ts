import { EventEmitter } from "node:events";
import type { ObjectEnum } from "./types";

export const EventNames = {
	Shutdown: "shutdown",
	WindowChanged: "window-changed",
} as const;

export type EventNames = ObjectEnum<typeof EventNames>;

type EventMap = {
	[key in EventNames]: string | undefined;
};

const emitter = new EventEmitter<EventMap>();
