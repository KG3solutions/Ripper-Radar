<script lang="ts">
	import { Info } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg" role="status">
	<p class="text-gray-600 text-sm flex items-start gap-2">
		<Info class="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
		<span>
			{@render children()}
		</span>
	</p>
</div>
