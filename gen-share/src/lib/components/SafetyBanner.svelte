<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';

	interface Props {
		sticky?: boolean;
	}

	let { sticky = true }: Props = $props();
</script>

<div
	class="bg-red-100 border border-red-200 px-4 py-3 {sticky ? 'sticky top-0 z-10' : ''}"
	role="alert"
>
	<p class="text-red-800 text-sm font-medium flex items-center gap-2">
		<AlertTriangle class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
		<span>Never run a generator indoors or in a garage. Carbon monoxide kills.</span>
	</p>
</div>
