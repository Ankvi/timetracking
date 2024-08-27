import { createLogger, format, transports } from "winston";

const { combine, timestamp, json, errors } = format;

export const logger = createLogger({
	level: "info",
	format: combine(errors({ stack: true }), timestamp(), json()),
	transports: [new transports.Console()],
});
