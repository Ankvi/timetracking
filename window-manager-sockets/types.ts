import type { ObjectEnum } from "../types";

export const WindowManager = {
	Hyprland: "hyprland",
	Sway: "sway",
} as const;

export type WindowManager = ObjectEnum<typeof WindowManager>;

export type ActiveWindowChangedEvent = {
	title: string;
};
