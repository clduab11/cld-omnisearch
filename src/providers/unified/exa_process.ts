import {
	ErrorType,
	ProcessingProvider,
	ProcessingResult,
	ProviderError,
} from '../../common/types.js';
import { ExaContentsProvider } from '../processing/exa_contents/index.js';
import { ExaSimilarProvider } from '../processing/exa_similar/index.js';

export type ExaProcessMode = 'contents' | 'similar';

export interface UnifiedExaProcessingProvider {
	name: string;
	description: string;
	process_content(
		url: string | string[],
		extract_depth?: 'basic' | 'advanced',
		mode?: ExaProcessMode,
	): Promise<ProcessingResult>;
}

export class UnifiedExaProcessProvider implements UnifiedExaProcessingProvider {
	name = 'exa_process';
	description =
		'Extract content with Exa. Modes: contents (full content from result IDs), similar (find similar pages).';

	private providers: Map<ExaProcessMode, ProcessingProvider> =
		new Map();

	constructor() {
		this.providers.set('contents', new ExaContentsProvider());
		this.providers.set('similar', new ExaSimilarProvider());
	}

	async process_content(
		url: string | string[],
		extract_depth: 'basic' | 'advanced' = 'basic',
		mode: ExaProcessMode = 'contents',
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
