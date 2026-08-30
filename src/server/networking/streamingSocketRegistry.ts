import { WebSocket } from "ws";

export class StreamingSocketRegistry {
	private static instance: StreamingSocketRegistry;

	public static getInstance() {
		if (!StreamingSocketRegistry.instance) StreamingSocketRegistry.instance = new StreamingSocketRegistry();
		return StreamingSocketRegistry.instance;
	}

	private streamingSockets = new Map<string, WebSocket>();
	private pendingStreamingSockets = new Map<string, (socket: WebSocket) => void>();

	public registerStreamingSocket(id: string, socket: WebSocket) {
		this.streamingSockets.set(id, socket);
		const resolve = this.pendingStreamingSockets.get(id);
		if (resolve) {
			resolve(socket);
			this.pendingStreamingSockets.delete(id);
		}
		socket.once("close", () => this.streamingSockets.delete(id));
	}

	public async getStreamingSocket(id: string): Promise<WebSocket> {
		const existing = this.streamingSockets.get(id);
		if (existing) return existing;
		return new Promise((resolve) => {
			this.pendingStreamingSockets.set(id, resolve);
		});
	}
}
