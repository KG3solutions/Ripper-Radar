<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		name: string;
		checked?: boolean;
		required?: boolean;
		disabled?: boolean;
		error?: boolean;
		children: Snippet;
		onchange?: (e: Event) => void;
	}

	let {
		name,
		checked = $bindable(false),
		required = false,
		disabled = false,
		error = false,
		children,
		onchange
	}: Props = $props();
</script>

<label
	class="
    flex items-start gap-3 cursor-pointer min-h-touch py-2
    {disabled ? 'opacity-50 cursor-not-allowed' : ''}
  "
>
	<div class="flex-shrink-0 mt-0.5">
		<input
			type="checkbox"
			{name}
			bind:checked
			{required}
			{disabled}
			{onchange}
			class="
        w-6 h-6 rounded-sm border-2
        text-blue-600
        focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        disabled:bg-gray-100 disabled:cursor-not-allowed
        {error ? 'border-red-600' : 'border-gray-400'}
      "
		/>
	</div>
	<span class="text-base text-gray-700 select-none">
		{@render children()}
	</span>
</label>
