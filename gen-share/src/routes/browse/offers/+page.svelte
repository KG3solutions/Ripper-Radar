<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Zap, Map, List } from 'lucide-svelte';
	import {
		fetchListings,
		listings,
		listingsLoading,
		listingsError,
		filter
	} from '$lib/stores/listings';
	import { isAuthenticated } from '$lib/stores/auth';
	import {
		PageHeader,
		SafetyBanner,
		ListingCard,
		Select,
		Chip,
		Button,
		EmptyState,
		InfoBanner
	} from '$lib/components';
	import {
		NEIGHBORHOOD_OPTIONS,
		WATTAGE_OPTIONS,
		FUEL_TYPE_OPTIONS,
		type Listing
	} from '$lib/types';

	let viewMode = $state<'list' | 'map'>('list');

	let selectedNeighborhood = $state('');
	let selectedWattage = $state('');
	let selectedFuel = $state('');

	onMount(() => {
		fetchListings({ type: 'offer' });
	});

	function handleFilterChange() {
		const filters: any = { type: 'offer' };
		if (selectedNeighborhood) filters.neighborhood = selectedNeighborhood;
		if (selectedWattage) filters.wattage = selectedWattage;
		if (selectedFuel) filters.fuel = selectedFuel;
		fetchListings(filters);
	}

	function clearFilters() {
		selectedNeighborhood = '';
		selectedWattage = '';
		selectedFuel = '';
		fetchListings({ type: 'offer' });
	}

	function handleMessage(listing: Listing) {
		if ($isAuthenticated) {
			goto(`${base}/listing/${listing.id}`);
		} else {
			goto(`${base}/login?redirectTo=${base}/listing/${listing.id}`);
		}
	}

	let hasActiveFilters = $derived(
		selectedNeighborhood || selectedWattage || selectedFuel
	);

	let offerCount = $derived($listings.length);
</script>

<svelte:head>
	<title>Available Generators - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Available Generators" backHref="/" />
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
					options={[{ value: '', label: 'All wattages' }, ...WATTAGE_OPTIONS]}
					bind:value={selectedWattage}
					onchange={handleFilterChange}
				/>
				<Select
					label=""
					name="fuel"
					options={[{ value: '', label: 'All fuel types' }, ...FUEL_TYPE_OPTIONS]}
					bind:value={selectedFuel}
					onchange={handleFilterChange}
				/>
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

		<!-- View Requests link -->
		<div class="mb-4">
			<a href="{base}/browse/requests" class="text-sm text-blue-600 hover:underline">
				Looking to lend? View requests instead &rarr;
			</a>
		</div>

		<!-- Results -->
		{#if $listingsLoading}
			<div class="py-12 text-center">
				<p class="text-gray-500">Loading offers...</p>
			</div>
		{:else if $listingsError}
			<div class="py-12 text-center">
				<p class="text-red-600">{$listingsError}</p>
				<Button variant="secondary" onclick={() => fetchListings({ type: 'offer' })} fullWidth={false}>
					Try again
				</Button>
			</div>
		{:else if $listings.length === 0}
			{#if hasActiveFilters}
				<EmptyState
					icon={Zap}
					title="No offers match your filters"
					description="Try expanding your wattage range or checking nearby neighborhoods."
				>
					{#snippet action()}
						<Button variant="secondary" onclick={clearFilters} fullWidth={false}>
							Clear all filters
						</Button>
					{/snippet}
				</EmptyState>
			{:else}
				<EmptyState
					icon={Zap}
					title="No offers yet"
					description="Be the first to offer a generator in your area."
				>
					{#snippet action()}
						<Button href="{base}/create/offer" fullWidth={false}>
							Post an offer
						</Button>
					{/snippet}
				</EmptyState>
			{/if}
		{:else}
			<p class="text-sm text-gray-600 mb-4">
				{offerCount} offer{offerCount === 1 ? '' : 's'} available
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
