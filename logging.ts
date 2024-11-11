import { Command } from "commander";
import { createLogger, format, transports } from "winston";
import { LOG_FILE } from "./program-data";

const { combine, timestamp, json, errors } = format;

export const logger = createLogger({
    level: "info",
    transports: [
        new transports.Console({
            format: combine(
                errors({ stack: true }),
                timestamp(),
                json({ space: 4 }),
            ),
        }),
        new transports.File({
            filename: LOG_FILE,
            format: combine(errors({ stack: true }), timestamp(), json()),
        }),
    ],
});

export const logging = new Command("logging");

logging.command("view-logs").action(async () => {
    const file = Bun.file(LOG_FILE);
    await Bun.write(Bun.stdout, file);
});
