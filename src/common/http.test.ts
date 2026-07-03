import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorType, ProviderError } from './types.js';
import { http_json } from './http.js';

describe('http_json', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	const mockFetch = (response: {
		ok: boolean;
		status: number;
		statusText: string;
		text: string;
	}) => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
			text: () => Promise.resolve(response.text),
		});
	};

	it('returns parsed JSON on successful response', async () => {
		mockFetch({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: JSON.stringify({ results: [1, 2, 3] }),
		});

		const result = await http_json<{ results: number[] }>(
			'test-provider',
			'https://api.example.com',
		);
		expect(result).toEqual({ results: [1, 2, 3] });
	});

	it('returns raw text when response is not valid JSON', async () => {
		mockFetch({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: 'plain text response',
		});

		const result = await http_json<string>(
			'test-provider',
			'https://api.example.com',
		);
		expect(result).toBe('plain text response');
	});

	it('returns undefined for empty body when no fallback type is provided', async () => {
		mockFetch({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: '',
		});

		const result = await http_json('test-provider', 'https://api.example.com');
		expect(result).toBeUndefined();
	});

	it('passes through fetch options', async () => {
		mockFetch({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: '{}',
		});

		await http_json('test-provider', 'https://api.example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: 'test' }),
		});

		expect(globalThis.fetch).toHaveBeenCalledWith(
			'https://api.example.com',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: 'test' }),
			}),
		);
	});

	it('aborts the request on timeout and throws HttpTimeoutError', async () => {
		globalThis.fetch = vi
			.fn()
			.mockImplementation(
				(_url: string, init: RequestInit) =>
					new Promise((_resolve, reject) => {
						init.signal?.addEventListener('abort', () => {
							const err = new Error('aborted');
							err.name = 'AbortError';
							reject(err);
						});
					}),
			);

		await expect(
			http_json('test-provider', 'https://api.example.com', {
				timeoutMs: 5,
			}),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.PROVIDER_ERROR &&
				/timeout/i.test(error.message) &&
				(error as { details?: { kind?: string } }).details?.kind ===
					'timeout',
		);
	});

	it('wraps non-abort fetch errors as HttpNetworkError', async () => {
		globalThis.fetch = vi
			.fn()
			.mockRejectedValue(new Error('ECONNREFUSED'));

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.PROVIDER_ERROR &&
				/ECONNREFUSED/.test(error.message) &&
				(error as { details?: { kind?: string } }).details?.kind ===
					'network',
		);
	});

	it('throws HttpTimeoutError on 408 status', async () => {
		mockFetch({
			ok: false,
			status: 408,
			statusText: 'Request Timeout',
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.PROVIDER_ERROR &&
				/timeout/i.test(error.message),
		);
	});

	it('throws API_ERROR for 404 status', async () => {
		mockFetch({
			ok: false,
			status: 404,
			statusText: 'Not Found',
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.API_ERROR &&
				/not found/i.test(error.message),
		);
	});

	it('throws API_ERROR for 401 status', async () => {
		mockFetch({
			ok: false,
			status: 401,
			statusText: 'Unauthorized',
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.API_ERROR &&
				error.message === 'Invalid API key',
		);
	});

	it('throws API_ERROR for 403 status', async () => {
		mockFetch({
			ok: false,
			status: 403,
			statusText: 'Forbidden',
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.API_ERROR &&
				error.message ===
					'API key does not have access to this endpoint',
		);
	});

	it('throws RATE_LIMIT for 429 status', async () => {
		mockFetch({
			ok: false,
			status: 429,
			statusText: 'Too Many Requests',
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.RATE_LIMIT,
		);
	});

	it('throws PROVIDER_ERROR for 5xx status', async () => {
		mockFetch({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.PROVIDER_ERROR &&
				error.message === 'test-provider API internal error',
		);
	});

	it('throws API_ERROR with provider message for other 4xx status', async () => {
		mockFetch({
			ok: false,
			status: 400,
			statusText: 'Bad Request',
			text: JSON.stringify({ message: 'Missing required field' }),
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.API_ERROR &&
				error.message === 'Unexpected error: Missing required field',
		);
	});

	it('falls back to status text when error body has no message', async () => {
		mockFetch({
			ok: false,
			status: 418,
			statusText: "I'm a teapot",
			text: '{}',
		});

		await expect(
			http_json('test-provider', 'https://api.example.com'),
		).rejects.toSatisfy(
			(error) =>
				error instanceof ProviderError &&
				error.type === ErrorType.API_ERROR &&
				error.message === "Unexpected error: I'm a teapot",
		);
	});

	it('allows expected statuses to pass through without throwing', async () => {
		mockFetch({
			ok: false,
			status: 404,
			statusText: 'Not Found',
			text: JSON.stringify({ error: 'Not found' }),
		});

		const result = await http_json('test-provider', 'https://api.example.com', {
			expectedStatuses: [404],
		});
		expect(result).toEqual({ error: 'Not found' });
	});
});
