import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '$lib/types';

// Auth state
export const session = writable<Session | null>(null);
export const user = writable<User | null>(null);
export const profile = writable<UserProfile | null>(null);
export const loading = writable(true);

// Derived states
export const isAuthenticated = derived(user, ($user) => !!$user);
export const isPhoneVerified = derived(profile, ($profile) => $profile?.phone_verified ?? false);

// Initialize auth state
export async function initAuth() {
	loading.set(true);

	const {
		data: { session: currentSession }
	} = await supabase.auth.getSession();

	if (currentSession) {
		session.set(currentSession);
		user.set(currentSession.user);
		await loadProfile(currentSession.user.id);
	}

	loading.set(false);

	// Listen for auth changes
	supabase.auth.onAuthStateChange(async (event, newSession) => {
		session.set(newSession);
		user.set(newSession?.user ?? null);

		if (newSession?.user) {
			await loadProfile(newSession.user.id);
		} else {
			profile.set(null);
		}
	});
}

// Load user profile
async function loadProfile(userId: string) {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (error) {
		console.error('Error loading profile:', error);
		profile.set(null);
		return;
	}

	profile.set(data as UserProfile);
}

// Sign in with OTP (phone)
export async function signInWithPhone(phone: string) {
	const { error } = await supabase.auth.signInWithOtp({
		phone,
		options: {
			channel: 'sms'
		}
	});

	if (error) throw error;
}

// Verify OTP code
export async function verifyOtp(phone: string, token: string) {
	const { data, error } = await supabase.auth.verifyOtp({
		phone,
		token,
		type: 'sms'
	});

	if (error) throw error;
	return data;
}

// Sign out
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;

	session.set(null);
	user.set(null);
	profile.set(null);
}

// Update profile
export async function updateProfile(updates: Partial<UserProfile>) {
	const currentUser = await new Promise<User | null>((resolve) => {
		const unsubscribe = user.subscribe((u) => {
			resolve(u);
			unsubscribe();
		});
	});

	if (!currentUser) throw new Error('Not authenticated');

	const { data, error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('id', currentUser.id)
		.select()
		.single();

	if (error) throw error;

	profile.set(data as UserProfile);
	return data;
}
