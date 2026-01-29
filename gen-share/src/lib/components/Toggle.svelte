<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		name: string;
		checked?: boolean;
		disabled?: boolean;
		children: Snippet;
		helper?: Snippet;
		onchange?: (e: Event) => void;
	}

	let {
		name,
		checked = $bindable(false),
		disabled = false,
		children,
		helper,
		onchange
	}: Props = $props();
</script>

<label
	class="
    flex items-center justify-between gap-4 cursor-pointer min-h-touch py-3 px-4
    bg-gray-50 border border-gray-200 rounded-lg
    {disabled ? 'opacity-50 cursor-not-allowed' : ''}
  "
>
	<div class="flex-1">
		<span class="text-base text-gray-800 font-medium block">
			{@render children()}
		</span>
		{#if helper}
			<span class="text-sm text-gray-500 block mt-1">
				{@render helper()}
			</span>
		{/if}
	</div>

	<div class="relative flex-shrink-0">
		<input type="checkbox" {name} bind:checked {disabled} {onchange} class="sr-only peer" />
		<div
			class="
        w-12 h-7 rounded-full transition-colors
        bg-gray-300 peer-checked:bg-blue-600
        peer-focus:ring-2 peer-focus:ring-blue-600 peer-focus:ring-offset-2
        peer-disabled:opacity-50
      "
		></div>
		<div
			class="
        absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow
        transition-transform peer-checked:translate-x-5
      "
		></div>
	</div>
</label>
