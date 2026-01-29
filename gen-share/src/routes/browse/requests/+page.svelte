<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { HelpingHand, Map, List } from 'lucide-svelte';
	import {
		fetchListings,
		listings,
		listingsLoading,
		listingsError
	} from '$lib/stores/listings';
	import { isAuthenticated } from '$lib/stores/auth';
	import {
		PageHeader,
		SafetyBanner,
		ListingCard,
		Select,
		Chip,
		Toggle,
		Button,
		EmptyState,
		InfoBanner
	} from '$lib/components';
	import {
		NEIGHBORHOOD_OPTIONS,
		REQUEST_WATTAGE_OPTIONS,
		type Listing
	} from '$lib/types';

	let viewMode = $state<'list' | 'map'>('list');

	let selectedNeighborhood = $state('');
	let selectedWattage = $state('');
	let urgentOnly = $state(false);

	onMount(() => {
		fetchListings({ type: 'request' });
	});

	function handleFilterChange() {
		const filters: any = { type: 'request' };
		if (selectedNeighborhood) filters.neighborhood = selectedNeighborhood;
		if (selectedWattage) filters.wattage = selectedWattage;
		if (urgentOnly) filters.urgentOnly = true;
		fetchListings(filters);
	}

	function clearFilters() {
		selectedNeighborhood = '';
		selectedWattage = '';
		urgentOnly = false;
		fetchListings({ type: 'request' });
	}

	function handleMessage(listing: Listing) {
		if ($isAuthenticated) {
			goto(`/listing/${listing.id}`);
		} else {
			goto(`/login?redirectTo=/listing/${listing.id}`);
		}
	}

	let hasActiveFilters = $derived(
		selectedNeighborhood || selectedWattage || urgentOnly
	);

	let requestCount = $derived($listings.length);
</script>

<svelte:head>
	<title>People Who Need Generators - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="People who need generators" backHref="/" />
	<SafetyBanner />

	<div class="px-4 py-4 max-w-content mx-auto">
		<!-- Filters -->
		<div class="mb-4">
			<p class="text-sm text-gray-600 mb-3">Filters</p>
			<div class="flex flex-wrap gap-2 mb-4">
				<Select
					label=""
					name="neighborhood"
					options={[{ value: '', label: 'All areas' }, ...NEIGHBORHOOD_OPTIONS]}
					bind:value={selectedNeighborhood}
					onchange={handleFilterChange}
				/>
				<Select
					label=""
					name="wattage"
					options={[{ value: '', label: 'All wattages' }, ...REQUEST_WATTAGE_OPTIONS]}
					bind:value={selectedWattage}
					onchange={handleFilterChange}
				/>
			</div>

			<div class="mb-4">
				<Toggle name="urgent" bind:checked={urgentOnly} onchange={handleFilterChange}>
					Urgent requests only
				</Toggle>
			</div>

			<!-- View toggle -->
			<div class="flex gap-2 mb-4">
				<Chip selected={viewMode === 'list'} onclick={() => (viewMode = 'list')}>
					<List class="w-4 h-4 mr-1" />
					List
				</Chip>
				<Chip selected={viewMode === 'map'} onclick={() => (viewMode = 'map')}>
					<Map class="w-4 h-4 mr-1" />
					Map
				</Chip>
			</div>
		</div>

		<!-- View Offers link -->
		<div class="mb-4">
			<a href="/browse/offers" class="text-sm text-blue-600 hover:underline">
				Looking to borrow? View offers instead &rarr;
			</a>
		</div>

		<!-- Results -->
		{#if $listingsLoading}
			<div class="py-12 text-center">
				<p class="text-gray-500">Loading requests...</p>
			</div>
		{:else if $listingsError}
			<div class="py-12 text-center">
				<p class="text-red-600">{$listingsError}</p>
				<Button variant="secondary" onclick={() => fetchListings({ type: 'request' })} fullWidth={false}>
					Try again
				</Button>
			</div>
		{:else if $listings.length === 0}
			{#if hasActiveFilters}
				<EmptyState
					icon={HelpingHand}
					title="No requests match your filters"
					description="Try removing some filters or check back later."
				>
					{#snippet action()}
						<Button variant="secondary" onclick={clearFilters} fullWidth={false}>
							Clear all filters
						</Button>
					{/snippet}
				</EmptyState>
			{:else}
				<EmptyState
					icon={HelpingHand}
					title="No requests in this area right now"
					description="Check back later or expand your search area."
				/>
			{/if}
		{:else}
			<p class="text-sm text-gray-600 mb-4">
				{requestCount} request{requestCount === 1 ? '' : 's'}
			</p>

			{#if viewMode === 'map'}
				<InfoBanner>
					Locations are approximate. Exact address shared after confirming.
				</InfoBanner>
				<div class="mt-4 bg-gray-200 rounded-lg h-64 flex items-center justify-center">
					<p class="text-gray-500">Map view coming soon</p>
				</div>
			{:else}
				<div class="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
					{#each $listings as listing (listing.id)}
						<ListingCard {listing} onmessage={handleMessage} />
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
