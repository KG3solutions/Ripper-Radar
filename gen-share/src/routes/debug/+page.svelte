<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let supabaseStatus = $state('checking...');
	let envVars = $state<Record<string, string>>({});

	$effect(() => {
		if (browser) {
			// Check environment variables
			envVars = {
				'PUBLIC_SUPABASE_URL': import.meta.env.PUBLIC_SUPABASE_URL || 'NOT SET',
				'PUBLIC_SUPABASE_ANON_KEY': import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
				'BASE_PATH': base,
				'MODE': import.meta.env.MODE,
				'DEV': String(import.meta.env.DEV),
				'PROD': String(import.meta.env.PROD),
			};

			// Test Supabase connection
			testSupabase();
		}
	});

	async function testSupabase() {
		try {
			const url = import.meta.env.PUBLIC_SUPABASE_URL;
			if (!url || url === 'https://placeholder.supabase.co') {
				supabaseStatus = 'ERROR: Placeholder URL - env vars not configured';
				return;
			}

			const response = await fetch(`${url}/rest/v1/`, {
				headers: {
					'apikey': import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
				}
			});

			if (response.ok) {
				supabaseStatus = 'Connected OK';
			} else {
				supabaseStatus = `Error: ${response.status} ${response.statusText}`;
			}
		} catch (e) {
			supabaseStatus = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
		}
	}
</script>

<div class="p-8 max-w-2xl mx-auto">
	<h1 class="text-2xl font-bold mb-6">Generator Share - Debug Page</h1>

	<div class="bg-green-100 text-green-800 p-4 rounded mb-6">
		If you can see this, the app is loading correctly!
	</div>

	<section class="mb-6">
		<h2 class="text-lg font-semibold mb-2">Current URL</h2>
		<pre class="bg-gray-100 p-3 rounded text-sm overflow-auto">{$page.url.href}</pre>
	</section>

	<section class="mb-6">
		<h2 class="text-lg font-semibold mb-2">Environment Variables</h2>
		<div class="bg-gray-100 p-3 rounded text-sm">
			{#each Object.entries(envVars) as [key, value]}
				<div class="mb-1">
					<span class="font-medium">{key}:</span>
					<span class="{value === 'NOT SET' ? 'text-red-600' : 'text-green-600'}">{value}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="mb-6">
		<h2 class="text-lg font-semibold mb-2">Supabase Connection</h2>
		<div class="bg-gray-100 p-3 rounded text-sm {supabaseStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}">
			{supabaseStatus}
		</div>
	</section>

	<section class="mb-6">
		<h2 class="text-lg font-semibold mb-2">Navigation Links</h2>
		<div class="space-y-2">
			<a href="{base}/" class="text-blue-600 hover:underline block">Home ({base}/)</a>
			<a href="{base}/browse/offers" class="text-blue-600 hover:underline block">Browse Offers</a>
			<a href="{base}/safety" class="text-blue-600 hover:underline block">Safety</a>
			<a href="{base}/login" class="text-blue-600 hover:underline block">Login</a>
		</div>
	</section>
</div>
