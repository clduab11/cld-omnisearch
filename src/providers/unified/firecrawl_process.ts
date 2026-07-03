import {
	ErrorType,
	ProcessingProvider,
	ProcessingResult,
	ProviderError,
} from '../../common/types.js';
import { FirecrawlActionsProvider } from '../processing/firecrawl_actions/index.js';
import { FirecrawlCrawlProvider } from '../processing/firecrawl_crawl/index.js';
import { FirecrawlExtractProvider } from '../processing/firecrawl_extract/index.js';
import { FirecrawlMapProvider } from '../processing/firecrawl_map/index.js';
import { FirecrawlScrapeProvider } from '../processing/firecrawl_scrape/index.js';

export type FirecrawlMode =
	'scrape' | 'crawl' | 'map' | 'extract' | 'actions';

export interface UnifiedFirecrawlProcessingProvider {
	name: string;
	description: string;
	process_content(
		url: string | string[],
		extract_depth?: 'basic' | 'advanced',
		mode?: FirecrawlMode,
	): Promise<ProcessingResult>;
}

export class UnifiedFirecrawlProvider implements UnifiedFirecrawlProcessingProvider {
	name = 'firecrawl_process';
	description =
		'Extract web content with Firecrawl. Modes: scrape (single page), crawl (deep crawl), map (URL discovery), extract (structured data), actions (interactive).';

	private providers: Map<FirecrawlMode, ProcessingProvider> =
		new Map();

	constructor() {
		this.providers.set('scrape', new FirecrawlScrapeProvider());
		this.providers.set('crawl', new FirecrawlCrawlProvider());
		this.providers.set('map', new FirecrawlMapProvider());
		this.providers.set('extract', new FirecrawlExtractProvider());
		this.providers.set('actions', new FirecrawlActionsProvider());
	}

	async process_content(
		url: string | string[],
		extract_depth: 'basic' | 'advanced' = 'basic',
		mode: FirecrawlMode = 'scrape',
	): Promise<ProcessingResult> {
		if (!mode) {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				'Mode parameter is required',
				this.name,
			);
		}

		const selectedProvider = this.providers.get(mode);

		if (!selectedProvider) {
			throw new ProviderError(
				ErrorType.INVALID_INPUT,
				`Invalid mode: ${mode}. Valid options: ${Array.from(this.providers.keys()).join(', ')}`,
				this.name,
			);
		}

		return selectedProvider.process_content(url, extract_depth);
	}
}
