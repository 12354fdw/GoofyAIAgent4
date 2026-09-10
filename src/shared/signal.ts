export interface SignalConnection {
	disconnect(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Signal<CB extends (...args: any[]) => any> {
	private listeners = new Set<CB>();

	public connect(cb: CB): SignalConnection {
		this.listeners.add(cb);

		let connected = true;
		return {
			disconnect: () => {
				if (!connected) return;
				connected = false;
				this.listeners.delete(cb);
			},
		};
	}

	public fire(...args: Parameters<CB>): void {
		const listeners = [...this.listeners];
		for (const listener of listeners) {
			listener(...args);
		}
	}
}
