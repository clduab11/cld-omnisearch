import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('env configuration', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
		vi.resetModules();
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	const importEnv = async () => {
		const module = await import('./env.js');
		return module;
	};

	it('reads standard environment variables', async () => {
		process.env.TAVILY_API_KEY = 'standard-key';
		const { TAVILY_API_KEY } = await importEnv();
		expect(TAVILY_API_KEY).toBe('standard-key');
	});

	it('falls back to MSTY_ prefixed environment variables', async () => {
		process.env.MSTY_BRAVE_API_KEY = 'msty-brave-key';
		const { BRAVE_API_KEY } = await importEnv();
		expect(BRAVE_API_KEY).toBe('msty-brave-key');
	});

	it('prefers standard variables over MSTY_ prefixed variables', async () => {
		process.env.KAGI_API_KEY = 'standard-kagi';
		process.env.MSTY_KAGI_API_KEY = 'msty-kagi';
		const { KAGI_API_KEY } = await importEnv();
		expect(KAGI_API_KEY).toBe('standard-kagi');
	});

	it('returns undefined for missing variables', async () => {
		delete process.env.EXA_API_KEY;
		delete process.env.MSTY_EXA_API_KEY;
		const { EXA_API_KEY } = await importEnv();
		expect(EXA_API_KEY).toBeUndefined();
	});

	it('exposes provider configuration with base URLs and timeouts', async () => {
		const { config } = await importEnv();

		expect(config.search.tavily.base_url).toBe('https://api.tavily.com');
		expect(config.search.tavily.timeout).toBe(30000);

		expect(config.search.brave.base_url).toBe(
			'https://api.search.brave.com/res/v1',
		);
		expect(config.search.brave.timeout).toBe(10000);
	});

	it('uses FIRECRAWL_BASE_URL for firecrawl endpoints when set', async () => {
		process.env.FIRECRAWL_BASE_URL = 'https://custom.firecrawl.example';
		const { config } = await importEnv();

		expect(config.processing.firecrawl_scrape.base_url).toBe(
			'https://custom.firecrawl.example/v1/scrape',
		);
		expect(config.processing.firecrawl_crawl.base_url).toBe(
			'https://custom.firecrawl.example/v1/crawl',
		);
	});

	it('uses default firecrawl endpoints when FIRECRAWL_BASE_URL is not set', async () => {
		delete process.env.FIRECRAWL_BASE_URL;
		delete process.env.MSTY_FIRECRAWL_BASE_URL;
		const { config } = await importEnv();

		expect(config.processing.firecrawl_scrape.base_url).toBe(
			'https://api.firecrawl.dev/v1/scrape',
		);
	});

	describe('validate_config', () => {
		it('logs available keys and missing keys', async () => {
			process.env.TAVILY_API_KEY = 'tavily-key';
			delete process.env.BRAVE_API_KEY;
			delete process.env.MSTY_BRAVE_API_KEY;

			const errorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const { validate_config } = await importEnv();
			validate_config();

			expect(errorSpy).toHaveBeenCalledWith(
				expect.stringContaining('TAVILY_API_KEY'),
			);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining('BRAVE_API_KEY'),
			);
		});

		it('warns when no API keys are available', async () => {
			process.env = {};

			const errorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const { validate_config } = await importEnv();
			validate_config();

			expect(errorSpy).toHaveBeenCalledWith(
				expect.stringContaining('No API keys found'),
			);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining('Missing API keys'),
			);
		});
	});
});
