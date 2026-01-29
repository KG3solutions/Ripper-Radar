<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';
	import type { Listing } from '$lib/types';

	interface Props {
		listing: Listing;
		onmessage?: (listing: Listing) => void;
	}

	let { listing, onmessage }: Props = $props();

	function handleMessage() {
		onmessage?.(listing);
	}
</script>

<article
	class="
    bg-white border border-gray-200 rounded-lg p-4 shadow-sm
    {listing.is_urgent ? 'border-l-4 border-l-amber-500' : ''}
  "
>
	<header class="flex justify-between items-start mb-2">
		<div class="flex items-center gap-2">
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
		<span class="text-sm text-gray-500">{listing.neighborhood}</span>
	</header>

	<h3 class="text-lg font-semibold text-gray-800 mb-1">
		{listing.wattage_range}
	</h3>

	<p class="text-base text-gray-600 mb-3">
		{listing.fuel_type}
		{#if listing.generator_type}
			&middot; {listing.generator_type}
		{/if}
	</p>

	{#if listing.listing_type === 'offer' && listing.available_until}
		<p class="text-sm text-gray-500 mb-4">
			Available until {new Date(listing.available_until).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			})}
		</p>
	{:else if listing.listing_type === 'request' && listing.timeframe}
		<p class="text-sm text-gray-500 mb-4">
			{listing.timeframe}
		</p>
	{/if}

	{#if listing.listing_type === 'request'}
		<div class="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
			<span>Has fuel: {listing.has_fuel ? 'Yes' : 'No'}</span>
			<span>&middot;</span>
			<span>Has cords: {listing.has_cords ? 'Yes' : 'No'}</span>
		</div>
	{/if}

	<div class="flex flex-wrap gap-2 mb-4">
		{#if listing.user?.phone_verified}
			<Badge variant="verified">Verified</Badge>
		{/if}
		{#if listing.user?.review_count && listing.user.review_count > 0}
			<Badge variant="rating">{listing.user.review_count} reviews</Badge>
		{:else}
			<Badge variant="new">New user</Badge>
		{/if}
	</div>

	<Button onclick={handleMessage}>
		Message
	</Button>
</article>
