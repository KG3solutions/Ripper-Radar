<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'text';
		size?: 'default' | 'small';
		disabled?: boolean;
		fullWidth?: boolean;
		type?: 'button' | 'submit' | 'reset';
		href?: string;
		children: Snippet;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		variant = 'primary',
		size = 'default',
		disabled = false,
		fullWidth = true,
		type = 'button',
		href,
		children,
		onclick
	}: Props = $props();

	const baseClasses =
		'font-medium rounded transition-default focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

	const sizeClasses = {
		default: 'h-14 md:h-12 px-6 text-lg',
		small: 'h-10 px-4 text-base'
	};

	const variantClasses = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
		secondary:
			'border-2 border-gray-300 bg-transparent text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100',
		danger:
			'border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-50 active:bg-red-100',
		text: 'text-blue-600 hover:underline bg-transparent'
	};

	let classes = $derived(
		`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''}`
	);
</script>

{#if href}
	<a {href} class={classes} class:pointer-events-none={disabled} aria-disabled={disabled}>
		{@render children()}
	</a>
{:else}
	<button {type} class={classes} {disabled} {onclick}>
		{@render children()}
	</button>
{/if}
