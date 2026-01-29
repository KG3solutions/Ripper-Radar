<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';

	interface Props {
		title: string;
		backHref?: string;
		backLabel?: string;
	}

	let { title, backHref, backLabel = 'Back' }: Props = $props();
</script>

<header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
	{#if backHref}
		<a
			href={backHref}
			class="
        p-2 -ml-2 text-gray-600 hover:text-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        rounded inline-flex items-center gap-1
      "
			aria-label={backLabel}
		>
			<ArrowLeft class="w-5 h-5" />
			<span class="sr-only sm:not-sr-only text-sm">{backLabel}</span>
		</a>
	{/if}

	<h1 class="text-lg font-semibold text-gray-800 flex-1 text-right">
		{title}
	</h1>
</header>
