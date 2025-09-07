import {
	ErrorType,
	ProcessingProvider,
	ProcessingResult,
	ProviderError,
} from '../../../common/types.js';
import {
	retry_with_backoff,
	validate_api_key,
} from '../../../common/utils.js';
import { http_json } from '../../../common/http.js';
import { config } from '../../../config/env.js';

interface ExaContentsRequest {
	ids: string[];
	text?: boolean;
	highlights?: boolean;
	summary?: boolean;
	livecrawl?: 'always' | 'fallback' | 'preferred';
}

interface ExaContentResult {
	id: string;
	title: string;
	url: string;
	text?: string;
	highlights?: string[];
	summary?: string;
	publishedDate?: string;
	author?: string;
}

interface ExaContentsResponse {
	results: ExaContentResult[];
	requestId: string;
}

export class ExaContentsProvider implements ProcessingProvider {
	name = 'exa_contents';
	description = 'Extract full content from Exa search result IDs';

	async process_content(
		ids: string | string[],
		extract_depth: 'basic' | 'advanced' = 'basic',
	): Promise<ProcessingResult> {
		const api_key = validate_api_key(
			config.processing.exa_contents.api_key,
			this.name,
		);

		const id_array = Array.isArray(ids) ? ids : [ids];

		if (id_array.length === 0) {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				'At least one ID must be provided',
				this.name,
			);
		}

		const process_request = async () => {
			try {
				const request_body: ExaContentsRequest = {
					ids: id_array,
					text: true,
					highlights: extract_depth === 'advanced',
					summary: extract_depth === 'advanced',
					livecrawl:
						extract_depth === 'advanced' ? 'preferred' : 'fallback',
				};


				const data = await http_json<ExaContentsResponse>(
					this.name,
					`${config.processing.exa_contents.base_url}/contents`,
					{
						method: 'POST',
						headers: {
							'x-api-key': api_key,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(request_body),
					},
				);

				// Combine all content
				let combined_content = '';
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
						combined_content += `**Full Content:**\n${result.text}\n\n`;
					} else {
						combined_content += `${content}\n\n`;
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
						title: `Content from ${data.results.length} Exa results`,
						word_count: total_word_count,
						urls_processed: data.results.length,
						successful_extractions: data.results.length,
						extract_depth,
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
					`Failed to extract contents: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
					this.name,
				);
			}
		};

		return retry_with_backoff(process_request);
	}
}
