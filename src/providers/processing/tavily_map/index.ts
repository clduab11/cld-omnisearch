import { http_json } from '../../../common/http.js';
import {
	ErrorType,
	ProcessingProvider,
	ProcessingResult,
	ProviderError,
} from '../../../common/types.js';
import {
	is_valid_url,
	retry_with_backoff,
	validate_api_key,
} from '../../../common/utils.js';
import { config } from '../../../config/env.js';

// Tavily Map (POST /map) discovers site URLs without extracting content.
// Like Crawl, it is synchronous and returns results directly.
// See: https://docs.tavily.com/documentation/api-reference/endpoint/map
interface TavilyMapResponse {
	base_url: string;
	results: string[];
	response_time: number;
}

export class TavilyMapProvider implements ProcessingProvider {
	name = 'tavily_map';
	description =
		'Fast site mapping with Tavily Map. Traverses a website starting from a base URL and returns the discovered URLs without extracting page content. Best for site auditing, URL discovery, and planning targeted extraction or crawl requests.';

	async process_content(
		url: string | string[],
		extract_depth: 'basic' | 'advanced' = 'basic',
	): Promise<ProcessingResult> {
		// Map only works with a single starting URL
		const map_url = Array.isArray(url) ? url[0] : url;

		if (!is_valid_url(map_url)) {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				`Invalid URL provided: ${map_url}`,
				this.name,
			);
		}

		const map_request = async () => {
			const api_key = validate_api_key(
				config.processing.tavily_map.api_key,
				this.name,
			);

			try {
				const data = await http_json<TavilyMapResponse>(
					this.name,
					`${config.processing.tavily_map.base_url}/map`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${api_key}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							url: map_url,
							max_depth: extract_depth === 'advanced' ? 3 : 1,
							limit: extract_depth === 'advanced' ? 200 : 50,
						}),
						signal: AbortSignal.timeout(
							config.processing.tavily_map.timeout,
						),
					},
				);

				if (!data.results || data.results.length === 0) {
					throw new ProviderError(
						ErrorType.PROVIDER_ERROR,
						'No URLs discovered during mapping',
						this.name,
					);
				}

				const formatted_content =
					`# Site Map for ${data.base_url}\n\n` +
					`Found ${data.results.length} URLs:\n\n` +
					data.results.map((page_url) => `- ${page_url}`).join('\n');

				const raw_contents = [
					{
						url: map_url,
						content: formatted_content,
					},
				];

				return {
					content: formatted_content,
					raw_contents,
					metadata: {
						title: `Site Map for ${data.base_url}`,
						word_count: data.results.length,
						urls_processed: 1,
						successful_extractions: 1,
						extract_depth,
					},
					source_provider: this.name,
				};
			} catch (error) {
				if (error instanceof ProviderError) {
					throw error;
				}
				throw new ProviderError(
					ErrorType.API_ERROR,
					`Failed to map website: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
					this.name,
				);
			}
		};

		return retry_with_backoff(map_request);
	}
}
