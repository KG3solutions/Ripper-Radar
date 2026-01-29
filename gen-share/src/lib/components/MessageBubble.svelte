<script lang="ts">
	interface Props {
		content: string;
		timestamp: string;
		sent: boolean;
		isSystemMessage?: boolean;
	}

	let { content, timestamp, sent, isSystemMessage = false }: Props = $props();

	function formatTime(ts: string): string {
		const date = new Date(ts);
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

<div class="flex flex-col {sent ? 'items-end' : 'items-start'} mb-4">
	{#if isSystemMessage}
		<div class="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg max-w-[90%] text-center">
			{content}
		</div>
	{:else}
		<div
			class="
        px-4 py-3 max-w-[80%] text-base
        {sent
				? 'bg-blue-600 text-white rounded-[16px] rounded-br-[4px]'
				: 'bg-gray-100 text-gray-800 rounded-[16px] rounded-bl-[4px]'}
      "
		>
			{content}
		</div>
	{/if}
	<span class="text-xs text-gray-400 mt-1 {sent ? 'mr-1' : 'ml-1'}">
		{formatTime(timestamp)}
	</span>
</div>
