import { sendCommand } from "@/server";
import { $, connect } from "bun";
import { logger } from "../../logging";
import type { WMSocket } from "../types";
import {
	Command,
	type CommandPayloads,
	HEADER_LENGTH,
	IpcEvent,
	MAGIC,
	MAGIC_LENGTH,
	type MessageHeader,
	type WindowEvent,
	isContent,
} from "./types";

function createMessage<T extends keyof CommandPayloads>(
	type: T,
	payload: CommandPayloads[T],
) {
	const stringified = JSON.stringify(payload);
	const message = Buffer.alloc(HEADER_LENGTH + stringified.length);
	MAGIC.copy(message);
	message.writeUInt32LE(stringified.length, MAGIC_LENGTH);
	message.writeUInt32LE(type, 10);
	if (stringified.length > 0) {
		message.write(stringified, HEADER_LENGTH);
	}
	return message;
}

function decodeHeader(buffer: Buffer): MessageHeader {
	const magic = buffer.subarray(0, MAGIC_LENGTH);
	if (!magic.equals(MAGIC)) {
		throw new Error(`Magic mismatch. Expected ${MAGIC}, but found ${magic}`);
	}
	const payloadLength = buffer.readUInt32LE(MAGIC_LENGTH);
	const type = buffer.readUInt16LE(MAGIC_LENGTH + 4) as IpcEvent;
	const isEvent = (buffer.readUInt32LE(MAGIC_LENGTH + 4) & (1 << 32)) > 0;

	return {
		type,
		isEvent,
		payloadLength,
	};
}

async function processIpcMessages(buffer: Buffer) {
	const readableLength = buffer.length;
	let bytesRead = 0;

	while (bytesRead < readableLength) {
		try {
			const header = buffer.subarray(bytesRead, bytesRead + HEADER_LENGTH);
			bytesRead += HEADER_LENGTH;
			const decoded = decodeHeader(header);
			if (!decoded.isEvent) {
				logger.info("Received sway message is not an event");
				return;
			}

			const message = buffer.toString(
				"utf8",
				bytesRead,
				bytesRead + decoded.payloadLength,
			);
			bytesRead += decoded.payloadLength;

			switch (decoded.type) {
				case IpcEvent.window: {
					const event: WindowEvent = JSON.parse(message);
					logger.debug({
						message: "Got sway window event",
						event,
					});
					if (!isContent(event.container)) {
						return;
					}
					if (["focus", "title"].includes(event.change)) {
						await sendCommand("active-window-changed", {
							application: event.container.app_id,
							title: event.container.name,
						});
						return;
					}
					logger.info({
						message: "unprocessed sway window event",
						type: event.change,
					});
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				logger.error({
					message: "Error when handling sway ipc event",
					type: error.name,
					description: error.message,
				});
			}
		}
	}
}

export async function connectToSocket(): Promise<WMSocket> {
	const socketPath = await $`sway --get-socketpath`.text();

	const socket = await connect({
		socket: {
			open: (socket) => {
				logger.info("Socket to swaywm opened");
				const subscribeMessage = createMessage(Command.subscribe, ["window"]);
				socket.write(subscribeMessage);
			},
			data: (_, data) => {
				processIpcMessages(data);
			},
			close: () => {
				logger.info("swaywm socket closed");
			},
		},
		unix: socketPath.trim(),
	});

	return socket;
}
