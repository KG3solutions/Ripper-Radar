import type { HandleClientError } from '@sveltejs/kit';

// Handle client-side errors gracefully
export const handleError: HandleClientError = ({ error, event }) => {
	console.error('Client error:', error);

	// If it's a JSON parse error from __data.json, ignore it
	// This happens when the static fallback returns HTML instead of JSON
	const message = error instanceof Error ? error.message : String(error);
	if (message.includes('Unexpected token') && message.includes('JSON')) {
		console.log('Ignoring JSON parse error from static fallback');
		return {
			message: 'Loading...'
		};
	}

	return {
		message: 'An error occurred'
	};
};
