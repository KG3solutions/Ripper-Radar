<script lang="ts">
	import type { Snippet, Component } from 'svelte';

	interface Props {
		icon?: Component;
		title: string;
		description: string;
		action?: Snippet;
	}

	let { icon, title, description, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center text-center py-12 px-4">
	{#if icon}
		<div class="text-gray-400 mb-4">
			<svelte:component this={icon} class="w-12 h-12" />
		</div>
	{/if}

	<h3 class="text-lg font-semibold text-gray-700 mb-2">
		{title}
	</h3>

	<p class="text-base text-gray-500 max-w-sm mb-6">
		{description}
	</p>

	{#if action}
		{@render action()}
	{/if}
</div>
