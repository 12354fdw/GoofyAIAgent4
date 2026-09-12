import axios, { AxiosError } from "axios";
import { LOGGER } from "../../shared/globals/logger.js";

export interface SearXNGResult {
	title: string;
	url: string;
	content?: string;
}

export async function webSearch(query: string) {
	const searXNGUrl = "localhost:8080";
	try {
		const response = await axios.get(`http://${searXNGUrl}/search`, {
			params: {
				q: query,
				format: "json",
				language: "en-US",
			},
			timeout: 6000,
		});

		const results: SearXNGResult[] = response.data?.results || [];

		const cleanResults = results.slice(0, 5).map((item) => ({
			title: item.title,
			url: item.url,
			snippet: item.content || "No snippet available",
		}));

		return cleanResults;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			LOGGER.warn("Web search failed with logs:", {
				message: error.message,
				code: error.code,
				status: error.response?.status,
				statusText: error.response?.statusText,
				responseData: error.response?.data,
				requestUrl: error.config?.url,
				method: error.config?.method,
				timeout: error.config?.timeout,
				query,
			});
		} else {
			LOGGER.error("Web search failed, no idea what the error is. Uhhhhhhh....", {
				error,
				query,
			});
		}

		throw error;
	}
}
