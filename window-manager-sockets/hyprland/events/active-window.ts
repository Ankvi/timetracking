import { logger } from "@/logging";
import { sendCommand } from "@/server";

export async function handle(application: string, title: string) {
	logger.debug(`Hyprland active window event:\n${application}\n${title}`);
	await sendCommand("active-window-changed", {
		application,
		title,
	});
}
