<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';
	import { Button, SafetyBanner } from '$lib/components';

	function handleOffer() {
		if ($isAuthenticated) {
			goto('/create/offer');
		} else {
			goto('/login?redirectTo=/create/offer');
		}
	}

	function handleRequest() {
		if ($isAuthenticated) {
			goto('/create/request');
		} else {
			goto('/login?redirectTo=/create/request');
		}
	}
</script>

<svelte:head>
	<title>Generator Share - Connect neighbors during power outages</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Hero section -->
	<div class="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-800 mb-3">
				Generator Share
			</h1>
			<p class="text-lg text-gray-600">
				Connect neighbors. No payments.<br />
				Use at your own risk.
			</p>
		</div>

		<!-- Safety banner -->
		<div class="mb-8">
			<SafetyBanner sticky={false} />
		</div>

		<!-- Action buttons -->
		<div class="space-y-4 mb-8">
			<Button onclick={handleOffer}>
				I have a generator
			</Button>

			<Button onclick={handleRequest}>
				I need a generator
			</Button>

			<Button variant="secondary" href="/browse/offers">
				Browse all listings
			</Button>
		</div>
	</div>

	<!-- Footer disclaimer -->
	<footer class="border-t border-gray-200 bg-white px-4 py-6">
		<div class="max-w-md mx-auto text-center">
			<p class="text-sm text-gray-500 mb-4">
				This site only connects people. We do not verify users or equipment.
				We are not responsible for any transactions, meetups, or outcomes.
			</p>

			<div class="flex justify-center gap-4 text-sm">
				<a href="/terms" class="text-blue-600 hover:underline">Terms of Use</a>
				<span class="text-gray-300">&middot;</span>
				<a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</a>
				<span class="text-gray-300">&middot;</span>
				<a href="/safety" class="text-blue-600 hover:underline">Safety Checklist</a>
			</div>
		</div>
	</footer>
</div>
