<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		label: string;
		name: string;
		options: Option[];
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		onchange?: (e: Event) => void;
	}

	let {
		label,
		name,
		options,
		value = $bindable(''),
		placeholder = 'Select an option',
		required = false,
		disabled = false,
		error = '',
		onchange
	}: Props = $props();
</script>

<div class="w-full">
	<label for={name} class="block text-sm text-gray-700 mb-1.5">
		{label}
		{#if required}
			<span class="text-red-600">*</span>
		{/if}
	</label>

	<div class="relative">
		<select
			{name}
			id={name}
			bind:value
			{required}
			{disabled}
			{onchange}
			class="
        w-full h-12 px-4 pr-10 text-base text-gray-800
        border-2 rounded bg-white
        transition-default
        appearance-none
        focus:border-blue-600 focus:ring-0 focus:outline-none
        disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        {error ? 'border-red-600' : 'border-gray-300'}
      "
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${name}-error` : undefined}
		>
			<option value="" disabled>{placeholder}</option>
			{#each options as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>

		<div
			class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</div>

	{#if error}
		<p id="{name}-error" class="mt-1.5 text-sm text-red-600" role="alert">
			{error}
		</p>
	{/if}
</div>
