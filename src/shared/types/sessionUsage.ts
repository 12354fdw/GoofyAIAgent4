export interface SessionUsage {
	cost: number;
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;

	accTotalTokens: number;

	waterEvaporatedLiters: number;
}
