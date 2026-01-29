<script lang="ts">
	interface Props {
		label: string;
		name: string;
		placeholder?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		maxlength?: number;
		rows?: number;
		oninput?: (e: Event) => void;
	}

	let {
		label,
		name,
		placeholder = '',
		value = $bindable(''),
		required = false,
		disabled = false,
		error = '',
		maxlength = 200,
		rows = 3,
		oninput
	}: Props = $props();

	let remainingChars = $derived(maxlength - (value?.length || 0));
</script>

<div class="w-full">
	<label for={name} class="block text-sm text-gray-700 mb-1.5">
		{label}
		{#if required}
			<span class="text-red-600">*</span>
		{/if}
	</label>

	<textarea
		{name}
		id={name}
		{placeholder}
		bind:value
		{required}
		{disabled}
		{maxlength}
		{rows}
		{oninput}
		class="
      w-full px-4 py-3 text-base text-gray-800
      border-2 rounded bg-white resize-none
      transition-default
      placeholder:text-gray-400
      focus:border-blue-600 focus:ring-0 focus:outline-none
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
      {error ? 'border-red-600' : 'border-gray-300'}
    "
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${name}-error` : `${name}-helper`}
	></textarea>

	<div class="flex justify-between mt-1.5">
		{#if error}
			<p id="{name}-error" class="text-sm text-red-600" role="alert">
				{error}
			</p>
		{:else}
			<span></span>
		{/if}
		<p id="{name}-helper" class="text-sm text-gray-500">
			{remainingChars} characters remaining
		</p>
	</div>
</div>
