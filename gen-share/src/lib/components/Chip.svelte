<script lang="ts">
	import { Check } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		selected?: boolean;
		disabled?: boolean;
		children: Snippet;
		onclick?: () => void;
	}

	let { selected = false, disabled = false, children, onclick }: Props = $props();
</script>

<button
	type="button"
	class="
    inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-sm
    transition-default
    focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    {selected
		? 'bg-blue-600 text-white border-transparent'
		: 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}
  "
	{disabled}
	{onclick}
	aria-pressed={selected}
>
	{#if selected}
		<Check class="w-4 h-4" aria-hidden="true" />
	{/if}
	{@render children()}
</button>
