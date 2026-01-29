<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		name: string;
		options: Option[];
		value?: string;
		label?: string;
		disabled?: boolean;
		error?: string;
		onchange?: (value: string) => void;
	}

	let {
		name,
		options,
		value = $bindable(''),
		label,
		disabled = false,
		error = '',
		onchange
	}: Props = $props();

	function handleChange(optionValue: string) {
		value = optionValue;
		onchange?.(optionValue);
	}
</script>

<fieldset class="w-full" {disabled}>
	{#if label}
		<legend class="block text-sm text-gray-700 mb-2">
			{label}
		</legend>
	{/if}

	<div class="flex gap-3">
		{#each options as option}
			<button
				type="button"
				class="
          flex-1 h-12 px-4 text-base font-medium rounded border-2
          transition-default
          focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          {value === option.value
					? 'bg-blue-600 border-blue-600 text-white'
					: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
        "
				onclick={() => handleChange(option.value)}
				aria-pressed={value === option.value}
			>
				{option.label}
			</button>
		{/each}
	</div>

	{#if error}
		<p class="mt-1.5 text-sm text-red-600" role="alert">
			{error}
		</p>
	{/if}
</fieldset>
