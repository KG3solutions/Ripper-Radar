<script lang="ts">
	// Minimal test page - no imports, no dependencies
	let counter = $state(0);
</script>

<div style="padding: 2rem; font-family: sans-serif;">
	<h1 style="color: green; font-size: 2rem;">Test Page Works!</h1>
	<p>If you see this, SvelteKit is working.</p>
	<p>Counter: {counter}</p>
	<button onclick={() => counter++} style="padding: 0.5rem 1rem; font-size: 1rem;">
		Click me
	</button>
</div>
