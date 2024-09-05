import * as hyprland from "./hyprland";
import * as sway from "./sway";
import { type WMSocket, WindowManager } from "./types";

export async function connect(wm: WindowManager): Promise<WMSocket> {
	switch (wm) {
		case WindowManager.Hyprland:
			return await hyprland.connectToSocket();

		case WindowManager.Sway:
			return await sway.connectToSocket();

		default: {
			throw new Error(`${wm} not implemented`);
		}
	}
}
