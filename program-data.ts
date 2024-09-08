import { name } from "./package.json";

export const CACHE_FOLDER = `${process.env.HOME}/.cache/${name}`;

export const DEFAULT_SERVER_SOCKET = `${CACHE_FOLDER}/server.sock`;
export const LOG_FILE = `${CACHE_FOLDER}/logs.log`;
