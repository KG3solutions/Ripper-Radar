import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

let supabaseInstance: SupabaseClient | null = null;
let initError: string | null = null;

try {
	if (!PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
		throw new Error('Supabase URL not configured');
	}
	if (!PUBLIC_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY === 'placeholder-anon-key') {
		throw new Error('Supabase anon key not configured');
	}
	supabaseInstance = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
} catch (e) {
	initError = e instanceof Error ? e.message : 'Unknown error initializing Supabase';
	console.error('Supabase init error:', initError);
	// Create a dummy client that will fail gracefully
	supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = supabaseInstance;
export const supabaseError = initError;

// Re-export types for convenience
export type { Session, User } from '@supabase/supabase-js';
