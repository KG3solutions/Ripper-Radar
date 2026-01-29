import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Listing, ListingType } from '$lib/types';

// Listings state
export const listings = writable<Listing[]>([]);
export const listingsLoading = writable(false);
export const listingsError = writable<string | null>(null);

// Filter state
export interface ListingsFilter {
	type?: ListingType;
	neighborhood?: string;
	wattage?: string;
	fuel?: string;
	urgentOnly?: boolean;
}

export const filter = writable<ListingsFilter>({});

// Fetch listings with filters
export async function fetchListings(filters: ListingsFilter = {}) {
	listingsLoading.set(true);
	listingsError.set(null);

	try {
		let query = supabase
			.from('listings')
			.select(
				`
        *,
        user:profiles!listings_user_id_fkey (
          id,
          display_name,
          phone_verified,
          positive_reviews,
          negative_reviews,
          created_at
        )
      `
			)
			.eq('is_active', true)
			.order('created_at', { ascending: false });

		if (filters.type) {
			query = query.eq('listing_type', filters.type);
		}

		if (filters.neighborhood) {
			query = query.eq('neighborhood', filters.neighborhood);
		}

		if (filters.wattage) {
			query = query.eq('wattage_range', filters.wattage);
		}

		if (filters.fuel) {
			query = query.eq('fuel_type', filters.fuel);
		}

		if (filters.urgentOnly) {
			query = query.eq('is_urgent', true);
		}

		const { data, error } = await query;

		if (error) throw error;

		listings.set((data as Listing[]) || []);
	} catch (err) {
		console.error('Error fetching listings:', err);
		listingsError.set('Failed to load listings. Please try again.');
		listings.set([]);
	} finally {
		listingsLoading.set(false);
	}
}

// Get single listing
export async function getListing(id: string): Promise<Listing | null> {
	const { data, error } = await supabase
		.from('listings')
		.select(
			`
      *,
      user:profiles!listings_user_id_fkey (
        id,
        display_name,
        phone_verified,
        positive_reviews,
        negative_reviews,
        created_at
      )
    `
		)
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error fetching listing:', error);
		return null;
	}

	return data as Listing;
}

// Create listing
export async function createListing(
	listing: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active' | 'user'>
): Promise<Listing> {
	const { data, error } = await supabase
		.from('listings')
		.insert([listing])
		.select()
		.single();

	if (error) throw error;

	return data as Listing;
}

// Update listing
export async function updateListing(
	id: string,
	updates: Partial<Listing>
): Promise<Listing> {
	const { data, error } = await supabase
		.from('listings')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;

	return data as Listing;
}

// Deactivate listing
export async function deactivateListing(id: string): Promise<void> {
	const { error } = await supabase
		.from('listings')
		.update({ is_active: false })
		.eq('id', id);

	if (error) throw error;
}

// Get user's listings
export async function getUserListings(userId: string): Promise<Listing[]> {
	const { data, error } = await supabase
		.from('listings')
		.select('*')
		.eq('user_id', userId)
		.eq('is_active', true)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching user listings:', error);
		return [];
	}

	return (data as Listing[]) || [];
}
