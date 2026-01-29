<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { User, Star, Edit, Trash2, LogOut, Settings } from 'lucide-svelte';
	import { profile, signOut, user } from '$lib/stores/auth';
	import { getUserListings, deactivateListing } from '$lib/stores/listings';
	import { fetchConversations, conversations } from '$lib/stores/conversations';
	import { supabase } from '$lib/supabase';
	import {
		PageHeader,
		Button,
		Badge,
		StatusPill,
		EmptyState,
		Modal
	} from '$lib/components';
	import {
		formatWattage,
		formatNeighborhood,
		type Listing,
		type Review
	} from '$lib/types';

	let listings = $state<Listing[]>([]);
	let reviews = $state<Review[]>([]);
	let loadingListings = $state(true);
	let loadingReviews = $state(true);
	let showDeleteModal = $state(false);
	let deletingAccount = $state(false);

	onMount(async () => {
		if ($user) {
			// Load user's listings
			listings = await getUserListings($user.id);
			loadingListings = false;

			// Load conversations
			await fetchConversations($user.id);

			// Load reviews
			const { data: reviewsData } = await supabase
				.from('reviews')
				.select('*, reviewer:profiles!reviews_reviewer_id_fkey(display_name)')
				.eq('reviewee_id', $user.id)
				.order('created_at', { ascending: false })
				.limit(5);

			reviews = reviewsData || [];
			loadingReviews = false;
		}
	});

	function formatJoinDate(date: string): string {
		return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}

	async function handleRemoveListing(id: string) {
		if (!confirm('Remove this listing? People won\'t be able to find it anymore.')) return;

		try {
			await deactivateListing(id);
			listings = listings.filter((l) => l.id !== id);
		} catch (err) {
			console.error('Error removing listing:', err);
		}
	}

	async function handleSignOut() {
		await signOut();
		goto('/');
	}

	async function handleDeleteAccount() {
		deletingAccount = true;
		try {
			// Delete user data via Supabase
			const { error } = await supabase.rpc('delete_user_account');
			if (error) throw error;

			await signOut();
			goto('/');
		} catch (err) {
			console.error('Error deleting account:', err);
			alert('Failed to delete account. Please try again.');
		} finally {
			deletingAccount = false;
		}
	}
</script>

<svelte:head>
	<title>Your Profile - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Your Profile" backHref="/" />

	<div class="px-4 py-6 max-w-content mx-auto">
		{#if $profile}
			<!-- Profile header -->
			<div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
				<div class="flex items-center gap-4">
					<div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
						<User class="w-8 h-8" />
					</div>
					<div>
						<h2 class="text-xl font-semibold text-gray-800">
							{$profile.display_name || 'User'}
						</h2>
						<p class="text-sm text-gray-500">
							Member since {formatJoinDate($profile.created_at)}
						</p>
					</div>
				</div>
			</div>

			<!-- Verification -->
			<section class="mb-6">
				<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
					Verification
				</h3>
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					{#if $profile.phone_verified}
						<div class="flex items-center gap-2">
							<Badge variant="verified">Verified</Badge>
							<span class="text-base text-gray-700">Phone verified</span>
						</div>
					{:else}
						<div class="flex items-center justify-between">
							<span class="text-base text-gray-700">Phone not verified</span>
							<Button variant="secondary" size="small" href="/login" fullWidth={false}>
								Verify now
							</Button>
						</div>
					{/if}
				</div>
			</section>

			<!-- Reputation -->
			<section class="mb-6">
				<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
					Your Reputation
				</h3>
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					<div class="flex items-center gap-2 mb-3">
						<Star class="w-5 h-5 text-amber-500 fill-current" />
						<span class="text-base text-gray-800">
							{$profile.positive_reviews} positive review{$profile.positive_reviews === 1 ? '' : 's'}
						</span>
					</div>
					<p class="text-sm text-gray-500 mb-4">
						{$profile.negative_reviews} negative review{$profile.negative_reviews === 1 ? '' : 's'}
					</p>

					{#if loadingReviews}
						<p class="text-sm text-gray-500">Loading reviews...</p>
					{:else if reviews.length === 0}
						<p class="text-sm text-gray-500 italic">
							No reviews yet. Complete a lend to receive your first review.
						</p>
					{:else}
						<div class="space-y-3 mt-4 pt-4 border-t border-gray-200">
							{#each reviews as review}
								<div class="text-sm">
									<p class="text-gray-800">
										"{review.comment || (review.sentiment === 'positive' ? 'Positive experience' : 'Negative experience')}"
									</p>
									<p class="text-gray-500 mt-1">
										— {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</section>

			<!-- Listings -->
			<section class="mb-6">
				<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
					Your Listings
				</h3>
				{#if loadingListings}
					<p class="text-sm text-gray-500">Loading listings...</p>
				{:else if listings.length === 0}
					<div class="bg-white border border-gray-200 rounded-lg p-4">
						<p class="text-base text-gray-500 mb-4">
							You don't have any active listings.
						</p>
						<div class="flex gap-2">
							<Button href="/create/offer" size="small" fullWidth={false}>
								Post an offer
							</Button>
							<Button href="/create/request" variant="secondary" size="small" fullWidth={false}>
								Post a request
							</Button>
						</div>
					</div>
				{:else}
					<div class="space-y-3">
						{#each listings as listing}
							<div class="bg-white border border-gray-200 rounded-lg p-4">
								<div class="flex items-start justify-between mb-2">
									<span class="text-sm font-medium text-gray-500 uppercase">
										{listing.listing_type} &middot; Active
									</span>
								</div>
								<p class="text-base font-medium text-gray-800">
									{formatWattage(listing.wattage_range)} &middot; {formatNeighborhood(listing.neighborhood)}
								</p>
								<div class="flex gap-3 mt-3">
									<a href="/listing/{listing.id}" class="text-sm text-blue-600 hover:underline flex items-center gap-1">
										<Edit class="w-4 h-4" />
										Edit
									</a>
									<button
										type="button"
										class="text-sm text-red-600 hover:underline flex items-center gap-1"
										onclick={() => handleRemoveListing(listing.id)}
									>
										<Trash2 class="w-4 h-4" />
										Remove
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Conversations -->
			<section class="mb-6">
				<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
					Your Conversations
				</h3>
				{#if $conversations.length === 0}
					<div class="bg-white border border-gray-200 rounded-lg p-4">
						<p class="text-base text-gray-500">
							No conversations yet. Message someone about a listing to start a conversation.
						</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each $conversations.slice(0, 5) as conv}
							<a
								href="/conversation/{conv.id}"
								class="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
							>
								<div class="flex items-start justify-between mb-2">
									<span class="text-base font-medium text-gray-800">
										With: {conv.other_user?.display_name || 'Unknown'}
									</span>
									<StatusPill status={conv.status} />
								</div>
								<p class="text-sm text-gray-500">
									{formatWattage(conv.listing?.wattage_range || '')} &middot;
									{formatNeighborhood(conv.listing?.neighborhood || '')}
								</p>
							</a>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Settings -->
			<section class="mb-6">
				<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
					Settings
				</h3>
				<div class="bg-white border border-gray-200 rounded-lg">
					<a
						href="/profile/edit"
						class="flex items-center gap-3 p-4 border-b border-gray-100 text-base text-gray-700 hover:bg-gray-50"
					>
						<Settings class="w-5 h-5 text-gray-400" />
						Edit profile
					</a>
					<button
						type="button"
						class="w-full flex items-center gap-3 p-4 text-base text-red-600 hover:bg-gray-50 text-left"
						onclick={() => (showDeleteModal = true)}
					>
						<Trash2 class="w-5 h-5" />
						Delete account
					</button>
				</div>
			</section>

			<!-- Sign out -->
			<Button variant="secondary" onclick={handleSignOut}>
				<LogOut class="w-5 h-5 mr-2" />
				Log out
			</Button>
		{:else}
			<div class="py-12 text-center">
				<p class="text-gray-500">Loading profile...</p>
			</div>
		{/if}
	</div>
</div>

<!-- Delete Account Modal -->
<Modal bind:open={showDeleteModal} title="Delete your account?">
	<p class="text-base text-gray-600 mb-6">
		This will permanently delete all your data, listings, and conversations. This cannot be undone.
	</p>

	<div class="space-y-3">
		<Button variant="danger" onclick={handleDeleteAccount} disabled={deletingAccount}>
			{deletingAccount ? 'Deleting...' : 'Delete account'}
		</Button>
		<Button variant="text" onclick={() => (showDeleteModal = false)}>
			Cancel
		</Button>
	</div>
</Modal>
