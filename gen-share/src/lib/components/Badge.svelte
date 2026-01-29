<script lang="ts">
	import { Check, Star } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		variant: 'verified' | 'rating' | 'new' | 'neutral';
		children: Snippet;
	}

	let { variant, children }: Props = $props();

	const variantClasses = {
		verified: 'bg-blue-100 text-blue-800',
		rating: 'bg-gray-100 text-gray-600',
		new: 'bg-amber-100 text-amber-600',
		neutral: 'bg-gray-100 text-gray-600'
	};
</script>

<span
	class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm {variantClasses[
		variant
	]}"
>
	{#if variant === 'verified'}
		<Check class="w-3.5 h-3.5" aria-hidden="true" />
	{:else if variant === 'rating'}
		<Star class="w-3.5 h-3.5 fill-current" aria-hidden="true" />
	{/if}
	{@render children()}
</span>
