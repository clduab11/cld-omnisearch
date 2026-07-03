import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
	},
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.es2022,
			},
		},
		rules: {
			'no-console': 'warn',
			'prefer-const': 'error',
		},
	},
);