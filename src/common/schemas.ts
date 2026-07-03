import * as v from 'valibot';
import { ErrorType, ProviderError } from './types.js';

const collapse_whitespace = (input: string): string => {
	return input.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
};

export const sanitized_query_schema = v.pipe(
	v.string('Search query must be a string'),
	v.trim(),
	v.minLength(1, 'Search query cannot be empty'),
	v.maxLength(2000, 'Search query is too long (max 2000 characters)'),
	v.transform(collapse_whitespace),
);

export const url_schema = v.pipe(
	v.string('URL must be a string'),
	v.trim(),
	v.minLength(1, 'URL cannot be empty'),
	v.maxLength(2048, 'URL is too long (max 2048 characters)'),
	v.url('Invalid URL format'),
	v.check((value) => {
		try {
			const parsed = new URL(value);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	}, 'URL must use http or https protocol'),
);

export const optional_url_schema = v.union(
	[v.literal(''), url_schema],
	'Invalid URL',
);

const api_key_pattern = /^[A-Za-z0-9_\-./+=]+$/;

export const api_key_schema = v.pipe(
	v.string('API key must be a string'),
	v.trim(),
	v.minLength(8, 'API key is too short'),
	v.maxLength(512, 'API key is too long'),
	v.regex(api_key_pattern, 'API key contains invalid characters'),
);

export const optional_api_key_schema = v.union(
	[v.literal(''), api_key_schema],
	'Invalid API key',
);

export const validate_api_key_schema = (
	key: string | undefined,
	provider: string,
): string => {
	const trimmed = (key ?? '').trim().replace(/^(['"])(.*)\1$/, '$2');

	const result = v.safeParse(optional_api_key_schema, trimmed);
	if (!result.success) {
		throw new ProviderError(
			ErrorType.INVALID_INPUT,
			`Invalid API key for ${provider}: ${result.issues[0]?.message ?? 'validation failed'}`,
			provider,
		);
	}
	return trimmed;
};

const coerce_number = (input: unknown): number => {
	if (typeof input === 'number') return input;
	if (typeof input === 'string' && input.trim() !== '') {
		const n = Number(input);
		if (Number.isFinite(n)) return n;
	}
	return NaN;
};

export const limit_schema = v.pipe(
	v.unknown(),
	v.transform(coerce_number),
	v.number('Limit must be a number'),
	v.integer('Limit must be an integer'),
	v.minValue(1, 'Limit must be at least 1'),
	v.maxValue(100, 'Limit cannot exceed 100'),
);

export const optional_limit_schema = v.union(
	[v.undefined_(), v.null_(), v.literal(0), limit_schema],
);

const domain_pattern =
	/^(?=^.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const domain_schema = v.pipe(
	v.string('Domain must be a string'),
	v.trim(),
	v.minLength(1, 'Domain cannot be empty'),
	v.maxLength(253, 'Domain is too long'),
	v.regex(domain_pattern, 'Invalid domain format'),
);

export const domain_list_schema = v.pipe(
	v.array(v.string('Each domain must be a string')),
	v.minLength(1, 'Domain list cannot be empty'),
	v.maxLength(50, 'Too many domains (max 50)'),
	v.transform((items) => items.map((d) => d.trim())),
	v.array(domain_schema),
);

const language_codes = new Set([
	'AR', 'BN', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'FA', 'FI',
	'FR', 'HE', 'HI', 'HU', 'ID', 'IT', 'JA', 'KO', 'NL', 'NO',
	'PL', 'PT', 'RO', 'RU', 'SV', 'TH', 'TR', 'VI', 'ZH', 'EN-US',
	'EN-GB', 'PT-BR', 'PT-PT', 'ZH-CN', 'ZH-TW',
]);

export const language_code_schema = v.pipe(
	v.string('Language code must be a string'),
	v.trim(),
	v.toUpperCase(),
	v.check(
		(value) => language_codes.has(value),
		'Invalid language code',
	),
);

export const search_params_schema = v.object({
	query: sanitized_query_schema,
	limit: v.optional(limit_schema),
	include_domains: v.optional(domain_list_schema),
	exclude_domains: v.optional(domain_list_schema),
	language: v.optional(language_code_schema),
	date_before: v.optional(v.string()),
	date_after: v.optional(v.string()),
});

const format_issues = (issues: v.GenericIssue[]): string => {
	if (issues.length === 0) return 'validation failed';
	return issues
		.map((i) => {
			const path = i.path
				?.map((p) => String((p as { key?: unknown }).key ?? p))
				.join('.');
			return path ? `${path}: ${i.message}` : i.message;
		})
		.join('; ');
};

export const parse_search_params = (
	input: unknown,
	provider: string,
): v.InferOutput<typeof search_params_schema> => {
	const result = v.safeParse(search_params_schema, input);
	if (!result.success) {
		throw new ProviderError(
			ErrorType.INVALID_INPUT,
			`Invalid search parameters for ${provider}: ${format_issues(result.issues)}`,
			provider,
			{ issues: result.issues },
		);
	}
	return result.output;
};

export const url_params_schema = v.object({
	url: url_schema,
	extract_depth: v.optional(
		v.picklist(['basic', 'advanced'], 'Invalid extract depth'),
	),
});

export const parse_url_params = (
	input: unknown,
	provider: string,
): v.InferOutput<typeof url_params_schema> => {
	const result = v.safeParse(url_params_schema, input);
	if (!result.success) {
		throw new ProviderError(
			ErrorType.INVALID_INPUT,
			`Invalid URL parameters for ${provider}: ${format_issues(result.issues)}`,
			provider,
			{ issues: result.issues },
		);
	}
	return result.output;
};
