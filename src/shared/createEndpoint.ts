import { WebSocket, type RawData } from "ws";
import type { Endpoint } from "comlink";

type MessageListener = (...args: unknown[]) => void;

export function createEndpoint(socket: WebSocket): Endpoint {
	const messageListeners = new Set<MessageListener>();

	socket.on("message", (data: RawData, isBinary: boolean) => {
		if (isBinary) return;

		let message: unknown;
		try {
			message = JSON.parse(data.toString());
		} catch {
			return;
		}

		messageListeners.forEach((listener) => listener({ data: message }));
	});

	return {
		postMessage(message: unknown) {
			if (socket.readyState !== WebSocket.OPEN) return;
			socket.send(JSON.stringify(message));
		},
		addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
			if (type === "message") messageListeners.add(listener as MessageListener);
		},
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
			if (type === "message") messageListeners.delete(listener as MessageListener);
		},
	};
}
