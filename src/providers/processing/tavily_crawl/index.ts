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

// Tavily Crawl (POST /crawl) is synchronous - unlike Firecrawl's crawl
// endpoint it returns the full result set in a single response, with no
// job polling required. See: https://docs.tavily.com/documentation/api-reference/endpoint/crawl
interface TavilyCrawlResponse {
	base_url: string;
	results: Array<{
		url: string;
		raw_content: string;
		favicon?: string;
	}>;
	response_time: number;
}

export class TavilyCrawlProvider implements ProcessingProvider {
	name = 'tavily_crawl';
	description =
		'Graph-based website crawling with Tavily Crawl. Traverses a website starting from a base URL, following internal links in parallel with built-in content extraction. Best for comprehensive site analysis, documentation ingestion, and discovering content across an entire domain.';

	async process_content(
		url: string | string[],
		extract_depth: 'basic' | 'advanced' = 'basic',
	): Promise<ProcessingResult> {
		// Crawl only works with a single starting URL
		const crawl_url = Array.isArray(url) ? url[0] : url;

		if (!is_valid_url(crawl_url)) {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				`Invalid URL provided: ${crawl_url}`,
				this.name,
			);
		}

		const crawl_request = async () => {
			const api_key = validate_api_key(
				config.processing.tavily_crawl.api_key,
				this.name,
			);

			try {
				const data = await http_json<TavilyCrawlResponse>(
					this.name,
					`${config.processing.tavily_crawl.base_url}/crawl`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${api_key}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							url: crawl_url,
							max_depth: extract_depth === 'advanced' ? 3 : 1,
							limit: extract_depth === 'advanced' ? 50 : 20,
							extract_depth,
						}),
						signal: AbortSignal.timeout(
							config.processing.tavily_crawl.timeout,
						),
					},
				);

				if (!data.results || data.results.length === 0) {
					throw new ProviderError(
						ErrorType.PROVIDER_ERROR,
						'No pages discovered during crawl',
						this.name,
					);
				}

				const raw_contents = data.results.map((page) => ({
					url: page.url,
					content: page.raw_content,
				}));

				const combined_content = raw_contents
					.map(
						(result) =>
							`# ${result.url}\n\n${result.content}\n\n---\n\n`,
					)
					.join('\n\n');

				const word_count = combined_content
					.split(/\s+/)
					.filter(Boolean).length;

				return {
					content: combined_content,
					raw_contents,
					metadata: {
						title: `Crawl of ${data.base_url}`,
						word_count,
						urls_processed: data.results.length,
						successful_extractions: data.results.length,
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
					`Failed to crawl website: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
					this.name,
				);
			}
		};

		return retry_with_backoff(crawl_request);
	}
}
