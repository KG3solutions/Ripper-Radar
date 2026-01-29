<script lang="ts">
	import { AlertTriangle, Check, X, Phone } from 'lucide-svelte';
	import { PageHeader } from '$lib/components';
</script>

<svelte:head>
	<title>Safety Checklist - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Safety Checklist" backHref="/" />

	<article class="px-4 py-6 max-w-readable mx-auto">
		<h2 class="text-xl font-bold text-gray-800 mb-4">Generator Safety</h2>

		<!-- CO Warning -->
		<div class="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
			<div class="flex items-center gap-2 mb-2">
				<AlertTriangle class="w-6 h-6 text-red-700" />
				<h3 class="text-lg font-bold text-red-800">CARBON MONOXIDE KILLS</h3>
			</div>
			<p class="text-base text-red-800">
				Carbon monoxide (CO) is an odorless, colorless gas. You cannot smell it. Every year,
				people die from running generators in enclosed spaces.
			</p>
		</div>

		<hr class="my-6 border-gray-200" />

		<!-- Do's and Don'ts -->
		<div class="space-y-4 mb-6">
			<div class="flex items-start gap-3">
				<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
					<Check class="w-4 h-4 text-green-600" />
				</div>
				<p class="text-base text-gray-800"><strong>ALWAYS</strong> run generators outdoors</p>
			</div>

			<div class="flex items-start gap-3">
				<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
					<X class="w-4 h-4 text-red-600" />
				</div>
				<p class="text-base text-gray-800"><strong>NEVER</strong> in a garage, even with the door open</p>
			</div>

			<div class="flex items-start gap-3">
				<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
					<X class="w-4 h-4 text-red-600" />
				</div>
				<p class="text-base text-gray-800"><strong>NEVER</strong> in a basement or crawlspace</p>
			</div>

			<div class="flex items-start gap-3">
				<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
					<X class="w-4 h-4 text-red-600" />
				</div>
				<p class="text-base text-gray-800"><strong>NEVER</strong> near windows, doors, or vents where exhaust can enter</p>
			</div>
		</div>

		<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
			<p class="text-base text-amber-800 font-medium">
				Keep generator at least 20 feet from any structure.
			</p>
		</div>

		<hr class="my-6 border-gray-200" />

		<!-- Other tips -->
		<h3 class="text-lg font-semibold text-gray-800 mb-4">OTHER SAFETY TIPS</h3>

		<ul class="space-y-3 mb-6">
			<li class="flex items-start gap-2">
				<span class="text-gray-400">&bull;</span>
				<span class="text-base text-gray-700">Let generator cool before refueling</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-gray-400">&bull;</span>
				<span class="text-base text-gray-700">Store fuel in approved containers away from living areas</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-gray-400">&bull;</span>
				<span class="text-base text-gray-700">Use heavy-duty outdoor-rated extension cords</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-gray-400">&bull;</span>
				<span class="text-base text-gray-700">Never plug a generator directly into a wall outlet (backfeed)</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-gray-400">&bull;</span>
				<span class="text-base text-gray-700">Install battery-operated CO detectors in your home</span>
			</li>
		</ul>

		<hr class="my-6 border-gray-200" />

		<!-- Emergency -->
		<h3 class="text-lg font-semibold text-gray-800 mb-4">IN AN EMERGENCY</h3>

		<p class="text-base text-gray-700 mb-4">
			If you feel dizzy, weak, or nauseous near a generator:
		</p>

		<ol class="space-y-2 mb-6 list-decimal list-inside">
			<li class="text-base text-gray-700">Get to fresh air immediately</li>
			<li class="text-base text-gray-700">Call 911</li>
			<li class="text-base text-gray-700">Do not re-enter the area</li>
		</ol>

		<div class="bg-gray-100 border border-gray-200 rounded-lg p-4">
			<div class="flex items-center gap-2 mb-2">
				<Phone class="w-5 h-5 text-gray-600" />
				<span class="text-base font-medium text-gray-800">Nashville Poison Control</span>
			</div>
			<a href="tel:1-800-222-1222" class="text-xl font-bold text-blue-600 hover:underline">
				1-800-222-1222
			</a>
		</div>
	</article>
</div>
