import { $ } from "bun";

export type ActiveWindowEvent = {
	application: string;
	directory: string;
};

export async function activeWindowEventHandler({
	directory,
}: ActiveWindowEvent) {
	const shell = $.cwd(directory);

	try {
		const currentBranch = (
			await shell`git rev-parse --abbrev-ref HEAD`.text()
		).trim();
		console.log(`Got new branch: ${currentBranch}`);
	} catch (error) {
		console.log("Current directory is not a git repository");
	}
}
