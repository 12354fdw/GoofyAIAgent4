import { WebSocket } from "ws";
import { NetworkedCheckpointDeltaData, NetworkedCheckpointDeltas } from "../../shared/checkpoints/networkedCheckpoints.js";

export class SessionWebsocketRegistry {
	private static instance: SessionWebsocketRegistry;

	public static getInstance() {
		if (!SessionWebsocketRegistry.instance) SessionWebsocketRegistry.instance = new SessionWebsocketRegistry();
		return SessionWebsocketRegistry.instance;
	}

	private sessions = new Map<string, Set<WebSocket>>();
	private socketToSession = new Map<WebSocket, string>();
	private orderCounter = 0;

	public registerSocket(socket: WebSocket, session: string = "default-session") {
		if (this.socketToSession.has(socket)) {
			this.changeSession(socket, session);
			return;
		}

		if (!this.sessions.has(session)) {
			this.sessions.set(session, new Set());
		}

		this.sessions.get(session)!.add(socket);
		this.socketToSession.set(socket, session);
		socket.once("close", () => this.unregisterSocket(socket));
	}

	public changeSession(socket: WebSocket, session: string) {
		const previous = this.socketToSession.get(socket);
		if (previous === session) return;

		const previousSet = previous ? this.sessions.get(previous) : undefined;
		previousSet?.delete(socket);
		if (previousSet && previousSet.size === 0 && previous) {
			this.sessions.delete(previous);
		}

		if (!this.sessions.has(session)) {
			this.sessions.set(session, new Set());
		}
		this.sessions.get(session)!.add(socket);
		this.socketToSession.set(socket, session);
	}

	public unregisterSocket(socket: WebSocket) {
		const session = this.socketToSession.get(socket);
		if (session === undefined) return;

		const sessionSet = this.sessions.get(session);
		sessionSet?.delete(socket);
		if (sessionSet && sessionSet.size === 0) {
			this.sessions.delete(session);
		}
		this.socketToSession.delete(socket);
	}

	public getSockets(session: string): Set<WebSocket> {
		return this.sessions.get(session) ?? new Set();
	}

	public broadcast(session: string, data: NetworkedCheckpointDeltaData) {
		const packet: NetworkedCheckpointDeltas = { ...data, order: this.orderCounter++ };
		this.getSockets(session).forEach((ws) => {
			ws.send(JSON.stringify(packet));
		});
	}
}
