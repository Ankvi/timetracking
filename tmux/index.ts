import { logger } from "@/logging";
import { handleEvent } from "./events";
import { updatePanes } from "./panes";

function startTmuxListener() {
    const proc = Bun.spawn(["tmux", "-C", "attach"], {
        stdin: "pipe",
    });

    async function processEvents() {
        const decoder = new TextDecoder();
        for await (const line of proc.stdout.values()) {
            const data = decoder.decode(line).trim();
            handleEvent(data);
        }

        logger.info("Closed tmux listener");
    }

    processEvents();

    return proc;
}

export async function start() {
    await updatePanes();
    return startTmuxListener();
}
