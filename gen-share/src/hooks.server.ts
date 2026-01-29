import type { Handle } from '@sveltejs/kit';

// For static adapter, server hooks only run during build/prerender.
// Authentication is handled client-side via the auth store.
// This minimal hook just passes through requests.

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
