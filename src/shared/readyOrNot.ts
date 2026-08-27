export class ReadyOrNot {
	private isReady = false;
	private waiters: Array<() => void> = [];

	public awaitReady(): Promise<void> {
		if (this.isReady) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve) => {
			this.waiters.push(resolve);
		});
	}

	public ready(): void {
		this.isReady = true;
		const waiters = this.waiters;
		this.waiters = [];
		for (const resolve of waiters) {
			resolve();
		}
	}
}
