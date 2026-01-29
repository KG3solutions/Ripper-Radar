<script lang="ts">
	interface Props {
		label: string;
		name: string;
		type?: 'text' | 'email' | 'tel' | 'password' | 'number';
		placeholder?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		helper?: string;
		maxlength?: number;
		autocomplete?: string;
		oninput?: (e: Event) => void;
	}

	let {
		label,
		name,
		type = 'text',
		placeholder = '',
		value = $bindable(''),
		required = false,
		disabled = false,
		error = '',
		helper = '',
		maxlength,
		autocomplete,
		oninput
	}: Props = $props();

	let remainingChars = $derived(maxlength ? maxlength - (value?.length || 0) : null);
</script>

<div class="w-full">
	<label for={name} class="block text-sm text-gray-700 mb-1.5">
		{label}
		{#if required}
			<span class="text-red-600">*</span>
		{/if}
	</label>

	<input
		{type}
		{name}
		id={name}
		{placeholder}
		bind:value
		{required}
		{disabled}
		{maxlength}
		{autocomplete}
		{oninput}
		class="
      w-full h-12 px-4 text-base text-gray-800
      border-2 rounded bg-white
      transition-default
      placeholder:text-gray-400
      focus:border-blue-600 focus:ring-0 focus:outline-none
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
      {error ? 'border-red-600' : 'border-gray-300'}
    "
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${name}-error` : helper ? `${name}-helper` : undefined}
	/>

	{#if error}
		<p id="{name}-error" class="mt-1.5 text-sm text-red-600" role="alert">
			{error}
		</p>
	{:else if helper}
		<p id="{name}-helper" class="mt-1.5 text-sm text-gray-500">
			{helper}
		</p>
	{:else if remainingChars !== null}
		<p class="mt-1.5 text-sm text-gray-500">
			{remainingChars} characters remaining
		</p>
	{/if}
</div>
