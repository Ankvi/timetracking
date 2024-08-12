import { connectToSocket } from "./hyprland";
import type { WindowManager } from "./types";

export async function connect(wm: WindowManager) {
	switch (wm) {
		case "hyprland":
			return await connectToSocket();
		default: {
			throw new Error(`${wm} not implemented`);
		}
	}
}
