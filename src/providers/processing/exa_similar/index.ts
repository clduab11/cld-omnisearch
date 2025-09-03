import {
	ErrorType,
	ProcessingProvider,
	ProcessingResult,
	ProviderError,
} from '../../../common/types.js';
import {
	handle_rate_limit,
	retry_with_backoff,
	validate_api_key,
} from '../../../common/utils.js';
import { config } from '../../../config/env.js';

interface ExaSimilarRequest {
	url: string;
	numResults?: number;
	contents?: {
		text?: { maxCharacters?: number };
		highlights?: boolean;
		summary?: boolean;
		livecrawl?: 'always' | 'fallback' | 'preferred';
	};
	includeDomains?: string[];
	excludeDomains?: string[];
}

interface ExaSimilarResult {
	id: string;
	title: string;
	url: string;
	text?: string;
	highlights?: string[];
	summary?: string;
	publishedDate?: string;
	author?: string;
	score?: number;
}

interface ExaSimilarResponse {
	results: ExaSimilarResult[];
	requestId: string;
}

export class ExaSimilarProvider implements ProcessingProvider {
	name = 'exa_similar';
	description =
		'Find web pages semantically similar to a given URL using Exa';

	async process_content(
		url: string | string[],
		extract_depth: 'basic' | 'advanced' = 'basic',
	): Promise<ProcessingResult> {
		const api_key = validate_api_key(
			config.processing.exa_similar.api_key,
			this.name,
		);

		// This provider only accepts a single URL
		const target_url = Array.isArray(url) ? url[0] : url;

		if (!target_url) {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				'A URL must be provided',
				this.name,
			);
		}

		// Validate URL format
		try {
			new URL(target_url);
		} catch {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				'Invalid URL format',
				this.name,
			);
		}

		const process_request = async () => {
			try {
				const request_body: ExaSimilarRequest = {
					url: target_url,
					numResults: extract_depth === 'advanced' ? 15 : 10,
					contents: {
						text: {
							maxCharacters:
								extract_depth === 'advanced' ? 3000 : 1500,
						},
						highlights: extract_depth === 'advanced',
						summary: extract_depth === 'advanced',
						livecrawl:
							extract_depth === 'advanced' ? 'preferred' : 'fallback',
					},
				};

				const response = await fetch(
					`${config.processing.exa_similar.base_url}/findSimilar`,
					{
						method: 'POST',
						headers: {
							'x-api-key': api_key,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(request_body),
					},
				);

				if (!response.ok) {
					switch (response.status) {
						case 401:
							throw new ProviderError(
								ErrorType.API_ERROR,
								'Invalid API key',
								this.name,
							);
						case 403:
							throw new ProviderError(
								ErrorType.API_ERROR,
								'API key does not have access to this endpoint',
								this.name,
							);
						case 429:
							handle_rate_limit(this.name);
							throw new ProviderError(
								ErrorType.RATE_LIMIT,
								'Rate limit exceeded',
								this.name,
							);
						case 500:
							throw new ProviderError(
								ErrorType.PROVIDER_ERROR,
								'Exa API internal error',
								this.name,
							);
						default:
							const error_text = await response.text();
							throw new ProviderError(
								ErrorType.API_ERROR,
								`Unexpected error: ${error_text}`,
								this.name,
							);
					}
				}

				const data = (await response.json()) as ExaSimilarResponse;

				// Combine all content
				let combined_content = `# Similar Pages to ${target_url}\n\n`;
				combined_content += `Found ${data.results.length} similar pages:\n\n`;

				const raw_contents: Array<{ url: string; content: string }> =
					[];
				let total_word_count = 0;

				for (const result of data.results) {
					const content =
						result.text || result.summary || 'No content available';
					const word_count = content.split(/\s+/).length;
					total_word_count += word_count;

					// Add to combined content
					combined_content += `## ${result.title}\n\n`;
					if (result.author) {
						combined_content += `**Author:** ${result.author}\n`;
					}
					if (result.publishedDate) {
						combined_content += `**Published:** ${result.publishedDate}\n`;
					}
					if (result.score) {
						combined_content += `**Similarity Score:** ${result.score.toFixed(
							3,
						)}\n`;
					}
					combined_content += `**URL:** ${result.url}\n\n`;

					if (result.highlights && result.highlights.length > 0) {
						combined_content += `**Key Highlights:**\n`;
						for (const highlight of result.highlights) {
							combined_content += `- ${highlight}\n`;
						}
						combined_content += '\n';
					}

					if (result.summary && result.text) {
						combined_content += `**Summary:** ${result.summary}\n\n`;
						combined_content += `**Content Preview:**\n${result.text.substring(
							0,
							500,
						)}${result.text.length > 500 ? '...' : ''}\n\n`;
					} else {
						combined_content += `${content.substring(0, 500)}${
							content.length > 500 ? '...' : ''
						}\n\n`;
					}

					combined_content += '---\n\n';

					// Add to raw contents
					raw_contents.push({
						url: result.url,
						content: content,
					});
				}

				return {
					content: combined_content,
					raw_contents,
					metadata: {
						title: `Similar pages to ${target_url}`,
						word_count: total_word_count,
						urls_processed: data.results.length,
						successful_extractions: data.results.length,
						extract_depth,
						original_url: target_url,
						requestId: data.requestId,
					},
					source_provider: this.name,
				};
			} catch (error) {
				if (error instanceof ProviderError) {
					throw error;
				}
				throw new ProviderError(
					ErrorType.API_ERROR,
					`Failed to find similar pages: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
					this.name,
				);
			}
		};

		return retry_with_backoff(process_request);
	}
}
