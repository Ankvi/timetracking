import type { Project } from "@/types";
import type { TmuxPaneTitle, TmuxPaneTitleParts } from "./types";

export function getProject(title: TmuxPaneTitle): Project {
	const [_, directory, branch] = title.split(" | ") as TmuxPaneTitleParts;
	return {
		directory,
		branch,
	};
}
