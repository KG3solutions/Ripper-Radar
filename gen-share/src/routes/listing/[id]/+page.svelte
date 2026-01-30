<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { getListing } from '$lib/stores/listings';
	import { startConversation } from '$lib/stores/conversations';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import {
		PageHeader,
		SafetyBanner,
		Button,
		Badge,
		UserCard,
		InfoBanner
	} from '$lib/components';
	import {
		formatWattage,
		formatFuelType,
		formatGeneratorType,
		formatNeighborhood,
		formatTimeframe,
		type Listing
	} from '$lib/types';
	import { AlertTriangle, Check } from 'lucide-svelte';

	let listing = $state<Listing | null>(null);
	let loading = $state(true);
	let error = $state('');
	let messageLoading = $state(false);

	let isCreated = $derived($page.url.searchParams.get('created') === 'true');
	let isOwnListing = $derived(listing?.user_id === $user?.id);

	onMount(async () => {
		const id = $page.params.id;
		listing = await getListing(id);
		if (!listing) {
			error = 'This listing is no longer available.';
		}
		loading = false;
	});

	async function handleMessage() {
		if (!listing) return;

		if (!$isAuthenticated) {
			goto(`${base}/login?redirectTo=${base}/listing/${listing.id}`);
			return;
		}

		messageLoading = true;

		try {
			const conversation = await startConversation(
				listing.id,
				listing.user_id,
				`Hi, I saw your ${listing.listing_type}. I'm interested.`
			);

			if (conversation) {
				goto(`${base}/conversation/${conversation.id}`);
			}
		} catch (err) {
			console.error('Error starting conversation:', err);
		} finally {
			messageLoading = false;
		}
	}

	function handleReport() {
		goto(`${base}/report?listing=${listing?.id}`);
	}
</script>

<svelte:head>
	<title>Listing Details - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Listing details" backHref="{base}/browse/offers" />
	<SafetyBanner />

	<div class="px-4 py-6 max-w-content mx-auto">
		{#if loading}
			<div class="py-12 text-center">
				<p class="text-gray-500">Loading listing...</p>
			</div>
		{:else if error}
			<div class="py-12 text-center">
				<p class="text-red-600 mb-4">{error}</p>
				<Button variant="secondary" href="{base}/browse/offers" fullWidth={false}>
					Browse listings
				</Button>
			</div>
		{:else if listing}
			{#if isCreated}
				<div class="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg flex items-center gap-3">
					<Check class="w-6 h-6 text-green-600 flex-shrink-0" />
					<p class="text-green-800 font-medium">Your listing is live</p>
				</div>
			{/if}

			<div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
				<!-- Type badge -->
				<div class="flex items-center gap-2 mb-4">
					<span
						class="text-sm font-medium uppercase tracking-wide
									 {listing.listing_type === 'offer' ? 'text-blue-600' : 'text-green-600'}"
					>
						{listing.listing_type}
					</span>
					{#if listing.is_urgent}
						<span class="flex items-center gap-1 text-sm text-amber-600 font-medium">
							<AlertTriangle class="w-4 h-4" />
							URGENT
						</span>
					{/if}
				</div>

				<!-- Main info -->
				<h2 class="text-xl font-semibold text-gray-800 mb-2">
					{formatWattage(listing.wattage_range)}
				</h2>
				<p class="text-base text-gray-600 mb-4">
					{formatFuelType(listing.fuel_type || '')}
					{#if listing.generator_type}
						&middot; {formatGeneratorType(listing.generator_type)}
					{/if}
				</p>

				<hr class="my-4 border-gray-200" />

				<!-- Details -->
				<div class="space-y-4">
					<div>
						<p class="text-sm text-gray-500">Neighborhood</p>
						<p class="text-base text-gray-800">{formatNeighborhood(listing.neighborhood)} (approximate)</p>
					</div>

					{#if listing.listing_type === 'offer' && listing.available_until}
						<div>
							<p class="text-sm text-gray-500">Available until</p>
							<p class="text-base text-gray-800">
								{new Date(listing.available_until).toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric'
								})}
							</p>
						</div>
					{/if}

					{#if listing.listing_type === 'request' && listing.timeframe}
						<div>
							<p class="text-sm text-gray-500">Needed by</p>
							<p class="text-base text-gray-800">{formatTimeframe(listing.timeframe)}</p>
						</div>
					{/if}

					{#if listing.listing_type === 'request'}
						<div class="flex gap-6">
							<div>
								<p class="text-sm text-gray-500">Has fuel</p>
								<p class="text-base text-gray-800">{listing.has_fuel ? 'Yes' : 'No'}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">Has cords</p>
								<p class="text-base text-gray-800">{listing.has_cords ? 'Yes' : 'No'}</p>
							</div>
						</div>
					{/if}

					{#if listing.notes}
						<div>
							<p class="text-sm text-gray-500">Notes</p>
							<p class="text-base text-gray-800">{listing.notes}</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Posted by -->
			{#if listing.user}
				<div class="mb-6">
					<p class="text-sm text-gray-500 mb-2">Posted by</p>
					<UserCard user={listing.user} />
				</div>
			{/if}

			<!-- Actions -->
			<div class="space-y-3">
				{#if isOwnListing}
					<InfoBanner>This is your listing.</InfoBanner>
					<Button variant="secondary" href="{base}/profile">
						Edit listing
					</Button>
				{:else}
					<Button onclick={handleMessage} disabled={messageLoading}>
						{messageLoading ? 'Starting conversation...' : 'Message'}
					</Button>
					<Button variant="secondary" onclick={handleReport}>
						Report this listing
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
