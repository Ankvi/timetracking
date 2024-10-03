import { logger } from "@/logging";
import type { Directory, Project } from "@/types";
import { $ } from "bun";
import { getProject } from "./titles";
import type { TmuxPaneId, TmuxPaneTitle } from "./types";

const tmuxPanes = new Map<TmuxPaneId, Directory>();

export async function updatePaneDirectory(
    paneId: TmuxPaneId,
    newDirectory?: Directory,
) {
    let directory = newDirectory;
    if (!newDirectory) {
        const project = await getProjectFromTitle(paneId);
        directory = project.directory;
    }

    if (!directory) {
        logger.warn(`Could not get directory for pane: ${paneId}`);
        return;
    }

    tmuxPanes.set(paneId, directory);
    return directory;
}

export async function updatePanes() {
    const delimiter = ";;";
    const panesResponse =
        await $`tmux list-panes -aF "#{pane_id}${delimiter}#{pane_current_path}`.text();

    const lines = panesResponse
        .trimEnd()
        .split("\n")
        .map((line) => line.split(delimiter, 2) as [TmuxPaneId, string]);

    tmuxPanes.clear();

    for (const line of lines) {
        const [id, directory] = line;
        tmuxPanes.set(id, directory);
    }
}

export async function getProjectFromTitle(
    paneId: TmuxPaneId,
): Promise<Project> {
    logger.debug(`Getting title of tmux pane: ${paneId}`);
    const title = (
        await $`tmux display -pt ${paneId} "#{pane_title}"`.text()
    ).trimEnd() as TmuxPaneTitle;

    logger.debug(`Tmux title: ${title}`);

    return getProject(title);
}

export async function getPaneDirectory<TForce extends boolean>(
    paneId: TmuxPaneId,
    force?: TForce,
): Promise<string | undefined> {
    if (force) {
        const directory = (
            await $`tmux display -pt ${paneId} "#{pane_current_path}"`.text()
        ).trimEnd();
        return directory;
    }
    return tmuxPanes.get(paneId);
}
