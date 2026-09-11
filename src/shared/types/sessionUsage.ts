export interface SessionUsage {
	cost: number;
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;

	waterEvaporatedLiters: number;
}
