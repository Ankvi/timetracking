import { createLogger, format, transports } from "winston";
import { LOG_FILE } from "./program-data";

const { combine, timestamp, json, errors } = format;

export const logger = createLogger({
	level: "info",
	format: combine(errors({ stack: true }), timestamp(), json()),
	transports: [
		new transports.Console(),
		new transports.File({
			filename: LOG_FILE,
		}),
	],
});
