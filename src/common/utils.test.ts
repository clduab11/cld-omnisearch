import { describe, expect, it } from 'vitest';
import {
	extract_domain,
	is_valid_url,
	parse_search_operators,
	sanitize_query,
} from './utils.js';

describe('sanitize_query', () => {
	it('trims leading and trailing whitespace', () => {
		expect(sanitize_query('  hello world  ')).toBe('hello world');
	});

	it('replaces newline characters with spaces', () => {
		expect(sanitize_query('line1\nline2\rline3')).toBe('line1 line2 line3');
	});

	it('replaces multiple consecutive newlines with single spaces', () => {
		expect(sanitize_query('a\n\n\rb')).toBe('a b');
	});

	it('returns an empty string for empty input', () => {
		expect(sanitize_query('')).toBe('');
	});
});

describe('extract_domain', () => {
	it('extracts hostname from a valid URL', () => {
		expect(extract_domain('https://example.com/path')).toBe('example.com');
	});

	it('removes www. prefix when present', () => {
		expect(extract_domain('https://www.example.com/path')).toBe(
			'example.com',
		);
	});

	it('returns an empty string for invalid URLs', () => {
		expect(extract_domain('not a url')).toBe('');
	});

	it('handles URLs with subdomains', () => {
		expect(extract_domain('https://blog.example.com')).toBe(
			'blog.example.com',
		);
	});
});

describe('is_valid_url', () => {
	it('returns true for valid HTTP URLs', () => {
		expect(is_valid_url('https://example.com')).toBe(true);
	});

	it('returns true for valid URLs with paths', () => {
		expect(is_valid_url('https://example.com/path?query=1')).toBe(true);
	});

	it('returns false for invalid URLs', () => {
		expect(is_valid_url('not a url')).toBe(false);
	});

	it('returns false for empty string', () => {
		expect(is_valid_url('')).toBe(false);
	});
});

describe('parse_search_operators', () => {
	it('returns the full query as base_query when no operators are present', () => {
		const result = parse_search_operators('hello world');
		expect(result.base_query).toBe('hello world');
		expect(result.operators).toEqual([]);
	});

	it('parses site: operator', () => {
		const result = parse_search_operators('site:example.com query');
		expect(result.base_query).toBe('query');
		expect(result.operators).toContainEqual({
			type: 'site',
			value: 'example.com',
			original_text: 'site:example.com',
		});
	});

	it('parses exclude_site operator', () => {
		const result = parse_search_operators('-site:example.com query');
		expect(result.base_query).toBe('query');
		expect(result.operators).toContainEqual({
			type: 'exclude_site',
			value: 'example.com',
			original_text: '-site:example.com',
		});
	});

	it('parses filetype and ext operators', () => {
		const filetype = parse_search_operators('filetype:pdf report');
		expect(filetype.operators).toContainEqual({
			type: 'filetype',
			value: 'pdf',
			original_text: 'filetype:pdf',
		});

		const ext = parse_search_operators('ext:md readme');
		expect(ext.operators).toContainEqual({
			type: 'ext',
			value: 'md',
			original_text: 'ext:md',
		});
	});

	it('parses exact phrase operator', () => {
		const result = parse_search_operators('"exact phrase" query');
		expect(result.base_query).toBe('query');
		expect(result.operators).toContainEqual({
			type: 'exact',
			value: 'exact phrase',
			original_text: '"exact phrase"',
		});
	});

	it('parses boolean operators', () => {
		const result = parse_search_operators('foo AND bar OR baz NOT qux');
		expect(result.operators).toEqual(
			expect.arrayContaining([
				{ type: 'boolean', value: 'AND', original_text: 'AND' },
				{ type: 'boolean', value: 'OR', original_text: 'OR' },
				{ type: 'boolean', value: 'NOT', original_text: 'NOT' },
			]),
		);
	});

	it('parses multiple operators in a single query', () => {
		const result = parse_search_operators(
			'site:example.com filetype:pdf "annual report"',
		);
		expect(result.base_query).toBe('');
		expect(result.operators).toHaveLength(3);
	});

	it('collapses remaining whitespace in base_query', () => {
		const result = parse_search_operators('  hello   world  ');
		expect(result.base_query).toBe('hello world');
	});
});
