import { sendCommand } from "../../server";

export async function handle(application: string, title: string) {
	console.debug(`Hyprland active window event:\n${application}\n${title}`);
	await sendCommand("active-window-changed", {
		application,
		title,
	});
}
