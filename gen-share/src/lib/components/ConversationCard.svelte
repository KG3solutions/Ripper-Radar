<script lang="ts">
	import StatusPill from './StatusPill.svelte';
	import type { Conversation } from '$lib/types';

	interface Props {
		conversation: Conversation;
	}

	let { conversation }: Props = $props();
</script>

<a
	href="/conversation/{conversation.id}"
	class="
    block bg-white border border-gray-200 rounded-lg p-4 shadow-sm
    hover:border-gray-300 transition-default
    focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
  "
>
	<div class="flex justify-between items-start mb-2">
		<span class="text-base font-medium text-gray-800">
			{conversation.listing?.wattage_range} &middot; {conversation.listing?.fuel_type}
		</span>
		<StatusPill status={conversation.status} />
	</div>

	<p class="text-sm text-gray-500 mb-2">
		{conversation.listing?.neighborhood}
	</p>

	<p class="text-sm text-gray-600">
		With: {conversation.other_user?.display_name || 'Unknown'}
	</p>

	{#if conversation.last_message}
		<p class="text-sm text-gray-500 mt-2 truncate">
			{conversation.last_message}
		</p>
	{/if}
</a>
