import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { ErrorType, ProviderError } from './types.js';
import {
	api_key_schema,
	domain_list_schema,
	domain_schema,
	language_code_schema,
	limit_schema,
	optional_api_key_schema,
	optional_url_schema,
	parse_search_params,
	parse_url_params,
	sanitized_query_schema,
	url_schema,
	validate_api_key_schema,
} from './schemas.js';

describe('sanitized_query_schema', () => {
	it('trims and collapses whitespace', () => {
		const result = v.parse(sanitized_query_schema, '  hello   world  \n');
		expect(result).toBe('hello world');
	});

	it('rejects empty queries', () => {
		expect(() => v.parse(sanitized_query_schema, '   ')).toThrow();
	});

	it('rejects non-strings', () => {
		expect(() => v.parse(sanitized_query_schema, 123 as unknown)).toThrow();
	});

	it('rejects queries over 2000 chars', () => {
		expect(() =>
			v.parse(sanitized_query_schema, 'a'.repeat(2001)),
		).toThrow();
	});
});

describe('url_schema', () => {
	it('accepts valid https URL', () => {
		expect(v.parse(url_schema, 'https://example.com/path')).toBe(
			'https://example.com/path',
		);
	});

	it('accepts valid http URL', () => {
		expect(v.parse(url_schema, 'http://example.com')).toBe(
			'http://example.com',
		);
	});

	it('rejects non-http protocols', () => {
		expect(() => v.parse(url_schema, 'ftp://example.com')).toThrow();
	});

	it('rejects malformed URLs', () => {
		expect(() => v.parse(url_schema, 'not a url')).toThrow();
	});

	it('optional schema accepts empty string', () => {
		expect(v.parse(optional_url_schema, '')).toBe('');
	});
});

describe('api_key_schema', () => {
	it('accepts typical key', () => {
		expect(v.parse(api_key_schema, 'sk-abc123_DEF-456')).toBe(
			'sk-abc123_DEF-456',
		);
	});

	it('rejects too short', () => {
		expect(() => v.parse(api_key_schema, 'short')).toThrow();
	});

	it('rejects invalid characters', () => {
		expect(() => v.parse(api_key_schema, 'has spaces and !@#')).toThrow();
	});

	it('optional schema accepts empty string', () => {
		expect(v.parse(optional_api_key_schema, '')).toBe('');
	});
});

describe('validate_api_key_schema', () => {
	it('returns trimmed key when valid', () => {
		const result = validate_api_key_schema('  valid_key_123  ', 'test');
		expect(result).toBe('valid_key_123');
	});

	it('strips surrounding quotes', () => {
		const result = validate_api_key_schema('"quoted_key_1234"', 'test');
		expect(result).toBe('quoted_key_1234');
	});

	it('throws ProviderError for invalid key', () => {
		expect(() => validate_api_key_schema('', 'myprovider')).toThrow(
			ProviderError,
		);
		try {
			validate_api_key_schema('short', 'myprovider');
		} catch (e) {
			expect(e).toBeInstanceOf(ProviderError);
			expect((e as ProviderError).type).toBe(ErrorType.INVALID_INPUT);
			expect((e as ProviderError).provider).toBe('myprovider');
		}
	});
});

describe('limit_schema', () => {
	it('accepts valid limit', () => {
		expect(v.parse(limit_schema, 10)).toBe(10);
	});

	it('coerces string numbers', () => {
		expect(v.parse(limit_schema, '25')).toBe(25);
	});

	it('rejects zero or negative', () => {
		expect(() => v.parse(limit_schema, 0)).toThrow();
		expect(() => v.parse(limit_schema, -1)).toThrow();
	});

	it('rejects over 100', () => {
		expect(() => v.parse(limit_schema, 101)).toThrow();
	});

	it('rejects non-numeric strings', () => {
		expect(() => v.parse(limit_schema, 'abc')).toThrow();
	});
});

describe('domain_schema', () => {
	it('accepts valid domain', () => {
		expect(v.parse(domain_schema, 'example.com')).toBe('example.com');
		expect(v.parse(domain_schema, 'sub.example.co.uk')).toBe(
			'sub.example.co.uk',
		);
	});

	it('rejects invalid domains', () => {
		expect(() => v.parse(domain_schema, 'not a domain')).toThrow();
		expect(() => v.parse(domain_schema, '-bad.com')).toThrow();
	});
});

describe('domain_list_schema', () => {
	it('accepts array of valid domains', () => {
		expect(
			v.parse(domain_list_schema, ['a.com', 'b.org']),
		).toEqual(['a.com', 'b.org']);
	});

	it('rejects empty arrays', () => {
		expect(() => v.parse(domain_list_schema, [])).toThrow();
	});

	it('rejects too many domains', () => {
		const arr = Array.from({ length: 51 }, (_, i) => `d${i}.com`);
		expect(() => v.parse(domain_list_schema, arr)).toThrow();
	});
});

describe('language_code_schema', () => {
	it('accepts and uppercases valid code', () => {
		expect(v.parse(language_code_schema, 'en')).toBe('EN');
	});

	it('accepts region-specific code', () => {
		expect(v.parse(language_code_schema, 'en-us')).toBe('EN-US');
	});

	it('rejects unknown code', () => {
		expect(() => v.parse(language_code_schema, 'xx')).toThrow();
	});
});

describe('parse_search_params', () => {
	it('returns parsed params for valid input', () => {
		const result = parse_search_params(
			{ query: '  hello world  ', limit: 10 },
			'brave',
		);
		expect(result.query).toBe('hello world');
		expect(result.limit).toBe(10);
	});

	it('throws ProviderError on invalid input', () => {
		try {
			parse_search_params({ query: '' }, 'brave');
			expect.fail('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(ProviderError);
			expect((e as ProviderError).type).toBe(ErrorType.INVALID_INPUT);
			expect((e as ProviderError).provider).toBe('brave');
		}
	});
});

describe('parse_url_params', () => {
	it('returns parsed url params', () => {
		const result = parse_url_params(
			{ url: 'https://example.com', extract_depth: 'basic' },
			'firecrawl',
		);
		expect(result.url).toBe('https://example.com');
		expect(result.extract_depth).toBe('basic');
	});

	it('rejects invalid extract_depth', () => {
		expect(() =>
			parse_url_params(
				{
					url: 'https://example.com',
					extract_depth: 'nuclear' as unknown as 'basic',
				},
				'firecrawl',
			),
		).toThrow(ProviderError);
	});
});
