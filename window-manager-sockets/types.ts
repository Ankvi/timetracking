import type { ObjectEnum } from "../types";

export const WindowManager = {
	Hyprland: "Hyprland",
	Sway: "sway",
} as const;

export type WindowManager = ObjectEnum<typeof WindowManager>;
