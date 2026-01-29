<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		children: Snippet;
		onclose?: () => void;
	}

	let { open = $bindable(false), title, children, onclose }: Props = $props();

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
	>
		<div
			class="
        bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto
        rounded-t-lg sm:rounded-lg
        shadow-md
      "
		>
			<div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
				{#if title}
					<h2 id="modal-title" class="text-lg font-semibold text-gray-800">
						{title}
					</h2>
				{:else}
					<span></span>
				{/if}
				<button
					type="button"
					class="
            p-2 -mr-2 text-gray-500 hover:text-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
            rounded
          "
					onclick={handleClose}
					aria-label="Close"
				>
					<X class="w-6 h-6" />
				</button>
			</div>

			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
