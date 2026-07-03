import { http_json } from '../../../common/http.js';
import {
	BaseSearchParams,
	ErrorType,
	ProviderError,
	SearchProvider,
	SearchResult,
} from '../../../common/types.js';
import {
	apply_search_operators,
	parse_search_operators,
	retry_with_backoff,
	sanitize_query,
	validate_api_key,
} from '../../../common/utils.js';
import { config } from '../../../config/env.js';

// Kagi's v1 Search API (POST /search, Bearer auth) replaced the old v0
// "Bot"-authenticated GET endpoint. Results are now namespaced by result
// type under `data.search[]`, `data.news[]`, etc. See:
// https://kagi.com/api/docs/openapi
interface KagiSearchResponse {
	meta?: {
		trace?: string;
		node?: string;
		ms?: number;
	};
	data?: {
		search?: Array<{
			url: string;
			title: string;
			snippet?: string;
			time?: string;
		}>;
	};
	error?: Array<{
		code: string;
		message?: string;
	}>;
}

export class KagiSearchProvider implements SearchProvider {
	name = 'kagi';
	description =
		'High-quality search with operators: site:, -site:, filetype:/ext:, intitle:, inurl:, inbody:, inpage:, lang:, loc:, before:, after:, +term, -term, "exact". Privacy-focused with specialized knowledge indexes. Best for research and technical documentation.';

	async search(params: BaseSearchParams): Promise<SearchResult[]> {
		const api_key = validate_api_key(
			config.search.kagi.api_key,
			this.name,
		);

		// Parse search operators from the query
		const parsed_query = parse_search_operators(params.query);
		const search_params = apply_search_operators(parsed_query);

		const search_request = async () => {
			try {
				let query = sanitize_query(search_params.query);

				// Handle domain filters using query string operators
				const include_domains = [
					...(params.include_domains ?? []),
					...(search_params.include_domains ?? []),
				];
				if (include_domains.length) {
					const domain_filter = include_domains
						.map((domain) => `site:${domain}`)
						.join(' OR ');
					query = `${query} (${domain_filter})`;
				}

				const exclude_domains = [
					...(params.exclude_domains ?? []),
					...(search_params.exclude_domains ?? []),
				];
				if (exclude_domains.length) {
					query = `${query} ${exclude_domains
						.map((domain) => `-site:${domain}`)
						.join(' ')}`;
				}

				// Add file type filter
				if (search_params.file_type) {
					query += ` filetype:${search_params.file_type}`;
				}

				// Add title and URL filters to the query
				if (search_params.title_filter) {
					query += ` intitle:${search_params.title_filter}`;
				}
				if (search_params.url_filter) {
					query += ` inurl:${search_params.url_filter}`;
				}

				// Add body filter
				if (search_params.body_filter) {
					query += ` inbody:${search_params.body_filter}`;
				}

				// Add page filter
				if (search_params.page_filter) {
					query += ` inpage:${search_params.page_filter}`;
				}

				// Add language filter
				if (search_params.language) {
					query += ` lang:${search_params.language}`;
				}

				// Add exact phrases
				if (search_params.exact_phrases?.length) {
					query += ` ${search_params.exact_phrases
						.map((phrase) => `"${phrase}"`)
						.join(' ')}`;
				}

				// Add force include terms
				if (search_params.force_include_terms?.length) {
					query += ` ${search_params.force_include_terms
						.map((term) => `+${term}`)
						.join(' ')}`;
				}

				// Add exclude terms
				if (search_params.exclude_terms?.length) {
					query += ` ${search_params.exclude_terms
						.map((term) => `-${term}`)
						.join(' ')}`;
				}

				// The v1 API exposes date range and region as structured
				// filters rather than inline query operators.
				const filters: Record<string, string> = {};
				if (search_params.date_after) {
					filters.after = search_params.date_after;
				}
				if (search_params.date_before) {
					filters.before = search_params.date_before;
				}
				if (search_params.location) {
					filters.region = search_params.location;
				}

				const request_body: Record<string, unknown> = {
					query: query.trim(),
					limit: params.limit ?? 10,
				};
				if (Object.keys(filters).length > 0) {
					request_body.filters = filters;
				}

				const data = await http_json<KagiSearchResponse>(
					this.name,
					`${config.search.kagi.base_url}/search`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${api_key}`,
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: JSON.stringify(request_body),
						signal: AbortSignal.timeout(config.search.kagi.timeout),
					},
				);

				if (data.error && data.error.length > 0) {
					throw new ProviderError(
						ErrorType.API_ERROR,
						`Kagi search error: ${
							data.error[0].message || data.error[0].code
						}`,
						this.name,
					);
				}

				return (data.data?.search || []).map((result) => ({
					title: result.title,
					url: result.url,
					snippet: result.snippet || '',
					source_provider: this.name,
				}));
			} catch (error) {
				if (error instanceof ProviderError) {
					throw error;
				}
				throw new ProviderError(
					ErrorType.API_ERROR,
					`Failed to fetch: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
					this.name,
				);
			}
		};

		return retry_with_backoff(search_request);
	}
}
