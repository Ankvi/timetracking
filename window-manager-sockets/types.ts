import type { ObjectEnum } from "../types";

export type WMSocket = {
    terminate: () => void | Promise<void>;
};

export const WindowManager = {
    Hyprland: "Hyprland",
    Sway: "sway",
} as const;

export type WindowManager = ObjectEnum<typeof WindowManager>;
