import { ErrorType, ProviderError } from './types.js';
import { handle_rate_limit } from './utils.js';

export class HttpTimeoutError extends ProviderError {
	constructor(provider: string, timeoutMs: number) {
		super(
			ErrorType.PROVIDER_ERROR,
			`Request to ${provider} timed out after ${timeoutMs}ms`,
			provider,
			{ kind: 'timeout', timeoutMs },
		);
		this.name = 'HttpTimeoutError';
	}
}

export class HttpNetworkError extends ProviderError {
	constructor(provider: string, cause: unknown) {
		const reason =
			cause instanceof Error ? cause.message : String(cause ?? 'unknown');
		super(
			ErrorType.PROVIDER_ERROR,
			`Network error contacting ${provider}: ${reason}`,
			provider,
			{ kind: 'network', cause: reason },
		);
		this.name = 'HttpNetworkError';
	}
}

export interface HttpJsonOptions extends RequestInit {
	expectedStatuses?: number[];
	timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

const tryParseJson = (text: string) => {
	if (!text) return undefined;
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
};

const isAbortError = (error: unknown): boolean => {
	if (!error || typeof error !== 'object') return false;
	const name = (error as { name?: string }).name;
	return name === 'AbortError' || name === 'TimeoutError';
};

const fetch_with_timeout = async (
	url: string,
	options: RequestInit,
	timeoutMs: number,
	provider: string,
): Promise<Response> => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	const { signal: externalSignal, ...rest } = options;
	let externalAbortListener: (() => void) | undefined;
	if (externalSignal) {
		if (externalSignal.aborted) {
			clearTimeout(timer);
			controller.abort();
		} else {
			externalAbortListener = () => controller.abort();
			externalSignal.addEventListener('abort', externalAbortListener, {
				once: true,
			});
		}
	}

	try {
		return await fetch(url, { ...rest, signal: controller.signal });
	} catch (error) {
		if (isAbortError(error)) {
			throw new HttpTimeoutError(provider, timeoutMs);
		}
		throw new HttpNetworkError(provider, error);
	} finally {
		clearTimeout(timer);
		if (externalSignal && externalAbortListener) {
			externalSignal.removeEventListener('abort', externalAbortListener);
		}
	}
};

export const http_json = async <T = any>(
	provider: string,
	url: string,
	options: HttpJsonOptions = {},
): Promise<T> => {
	const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
	const res = await fetch_with_timeout(
		url,
		fetchOptions,
		timeoutMs,
		provider,
	);
	const raw = await res.text();
	const body = tryParseJson(raw);

	const okOrExpected =
		res.ok ||
		(options.expectedStatuses &&
			options.expectedStatuses.includes(res.status));

	if (!okOrExpected) {
		const message =
			(body && (body.message || body.error || body.detail)) ||
			raw ||
			res.statusText;

		switch (res.status) {
			case 401:
				throw new ProviderError(
					ErrorType.API_ERROR,
					'Invalid API key',
					provider,
				);
			case 403:
				throw new ProviderError(
					ErrorType.API_ERROR,
					'API key does not have access to this endpoint',
					provider,
				);
			case 404:
				throw new ProviderError(
					ErrorType.API_ERROR,
					`${provider} endpoint not found`,
					provider,
				);
			case 408:
				throw new HttpTimeoutError(provider, timeoutMs);
			case 429:
				handle_rate_limit(provider);
			default:
				if (res.status >= 500) {
					throw new ProviderError(
						ErrorType.PROVIDER_ERROR,
						`${provider} API internal error`,
						provider,
					);
				}
				throw new ProviderError(
					ErrorType.API_ERROR,
					`Unexpected error: ${message}`,
					provider,
				);
		}
	}

	return (body as T) ?? (raw as unknown as T);
};
