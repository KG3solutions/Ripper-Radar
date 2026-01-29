<script lang="ts">
	import { PageHeader } from '$lib/components';
</script>

<svelte:head>
	<title>Privacy Policy - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Privacy Policy" backHref="/" />

	<article class="px-4 py-6 max-w-readable mx-auto">
		<p class="text-sm text-gray-500 mb-6">Last updated: January 29, 2026</p>

		<hr class="my-6 border-gray-200" />

		<section class="mb-8">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">WHAT WE COLLECT</h2>
			<ul class="space-y-2 text-base text-gray-700">
				<li>&bull; Phone number (for verification)</li>
				<li>&bull; Neighborhood (not exact address)</li>
				<li>&bull; Listing information you provide</li>
				<li>&bull; Messages between users</li>
			</ul>
		</section>

		<hr class="my-6 border-gray-200" />

		<section class="mb-8">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">WHAT WE DON'T COLLECT</h2>
			<ul class="space-y-2 text-base text-gray-700">
				<li>&bull; Payment information</li>
				<li>&bull; Social security numbers</li>
				<li>&bull; Government ID</li>
			</ul>
		</section>

		<hr class="my-6 border-gray-200" />

		<section class="mb-8">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">HOW WE PROTECT YOUR ADDRESS</h2>
			<ul class="space-y-2 text-base text-gray-700">
				<li>&bull; Your exact address is never shown publicly</li>
				<li>&bull; Listings only show your neighborhood</li>
				<li>&bull; Map pins are fuzzed to a 0.5-1 mile radius</li>
				<li>&bull; Exact address is only shared when you explicitly choose to send it in a private message</li>
			</ul>
		</section>

		<hr class="my-6 border-gray-200" />

		<section class="mb-8">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">DATA RETENTION</h2>
			<ul class="space-y-2 text-base text-gray-700">
				<li>&bull; Listings expire automatically</li>
				<li>&bull; You can delete your account and data at any time</li>
				<li>&bull; We do not sell your data</li>
			</ul>
		</section>

		<hr class="my-6 border-gray-200" />

		<section class="mb-8">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">CONTACT</h2>
			<p class="text-base text-gray-700">
				Questions? Email:
				<a href="mailto:privacy@generatorshare.org" class="text-blue-600 hover:underline">
					privacy@generatorshare.org
				</a>
			</p>
		</section>
	</article>
</div>
