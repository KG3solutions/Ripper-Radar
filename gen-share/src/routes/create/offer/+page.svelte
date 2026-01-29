<script lang="ts">
	import { goto } from '$app/navigation';
	import { createListing } from '$lib/stores/listings';
	import { profile, isPhoneVerified } from '$lib/stores/auth';
	import {
		PageHeader,
		SafetyBanner,
		Button,
		Select,
		Textarea,
		Checkbox,
		InfoBanner
	} from '$lib/components';
	import {
		GENERATOR_TYPE_OPTIONS,
		WATTAGE_OPTIONS,
		FUEL_TYPE_OPTIONS,
		NEIGHBORHOOD_OPTIONS
	} from '$lib/types';

	// Form state
	let generatorType = $state('');
	let wattageRange = $state('');
	let fuelType = $state('');
	let neighborhood = $state('');
	let availableUntil = $state(getDefaultDate());
	let notes = $state('');
	let agreed = $state(false);

	// Form errors
	let errors = $state<Record<string, string>>({});
	let loading = $state(false);
	let submitError = $state('');

	function getDefaultDate(): string {
		const date = new Date();
		date.setDate(date.getDate() + 7);
		return date.toISOString().split('T')[0];
	}

	function validate(): boolean {
		errors = {};

		if (!generatorType) errors.generatorType = 'Select a generator type';
		if (!wattageRange) errors.wattageRange = 'Select a wattage range';
		if (!fuelType) errors.fuelType = 'Select a fuel type';
		if (!neighborhood) errors.neighborhood = 'Select your neighborhood';
		if (!agreed) errors.agreed = 'You must agree before posting';

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validate()) return;

		loading = true;
		submitError = '';

		try {
			const listing = await createListing({
				listing_type: 'offer',
				generator_type: generatorType as any,
				wattage_range: wattageRange as any,
				fuel_type: fuelType as any,
				neighborhood: neighborhood as any,
				available_until: availableUntil,
				notes: notes || undefined,
				is_urgent: false
			});

			goto(`/listing/${listing.id}?created=true`);
		} catch (err: any) {
			console.error('Error creating listing:', err);
			submitError = err.message || 'Failed to create listing. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Offer a Generator - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Offer generator" backHref="/" backLabel="Cancel" />
	<SafetyBanner />

	<div class="px-4 py-6 max-w-form mx-auto">
		{#if !$isPhoneVerified}
			<InfoBanner>
				You need to verify your phone number before posting. <a href="/login" class="underline">Verify now</a>
			</InfoBanner>
			<div class="mt-6"></div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="space-y-6">
				<Select
					label="Generator type"
					name="generatorType"
					options={GENERATOR_TYPE_OPTIONS}
					bind:value={generatorType}
					required
					error={errors.generatorType}
					placeholder="Select type"
				/>

				<Select
					label="Wattage range"
					name="wattageRange"
					options={WATTAGE_OPTIONS}
					bind:value={wattageRange}
					required
					error={errors.wattageRange}
					placeholder="Select wattage"
				/>

				<Select
					label="Fuel type"
					name="fuelType"
					options={FUEL_TYPE_OPTIONS}
					bind:value={fuelType}
					required
					error={errors.fuelType}
					placeholder="Select fuel type"
				/>

				<Select
					label="Your neighborhood"
					name="neighborhood"
					options={NEIGHBORHOOD_OPTIONS}
					bind:value={neighborhood}
					required
					error={errors.neighborhood}
					placeholder="Select neighborhood"
				/>

				<div>
					<label for="availableUntil" class="block text-sm text-gray-700 mb-1.5">
						Available until
					</label>
					<input
						type="date"
						id="availableUntil"
						name="availableUntil"
						bind:value={availableUntil}
						min={new Date().toISOString().split('T')[0]}
						class="
							w-full h-12 px-4 text-base text-gray-800
							border-2 border-gray-300 rounded bg-white
							focus:border-blue-600 focus:ring-0 focus:outline-none
						"
					/>
				</div>

				<Textarea
					label="Notes (optional)"
					name="notes"
					bind:value={notes}
					placeholder="Pickup only. Can show you how to start it."
					maxlength={200}
				/>
			</div>

			<div class="mt-8 pt-6 border-t border-gray-200">
				<Checkbox name="agreed" bind:checked={agreed} error={!!errors.agreed}>
					I understand this app does not provide, inspect, or guarantee equipment.
					I am lending at my own risk.
				</Checkbox>
				{#if errors.agreed}
					<p class="mt-1 text-sm text-red-600">{errors.agreed}</p>
				{/if}
			</div>

			{#if submitError}
				<div class="mt-4 p-3 bg-red-100 border border-red-200 rounded">
					<p class="text-sm text-red-700">{submitError}</p>
				</div>
			{/if}

			<div class="mt-6">
				<Button type="submit" disabled={loading || !$isPhoneVerified}>
					{loading ? 'Posting...' : 'Post offer'}
				</Button>
			</div>
		</form>
	</div>
</div>
