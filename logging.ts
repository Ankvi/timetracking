import { type Logger, createLogger, format, transports } from "winston";

const { combine, timestamp, json, errors } = format;

export let logger: Logger;

export function initializeLogger(verbose?: boolean) {
	logger = createLogger({
		level: verbose ? "debug" : "info",
		format: combine(errors({ stack: true }), timestamp(), json()),
		transports: [new transports.Console()],
	});
}
