<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { createListing } from '$lib/stores/listings';
	import { profile, isVerified } from '$lib/stores/auth';
	import {
		PageHeader,
		SafetyBanner,
		Button,
		Select,
		Textarea,
		Checkbox,
		Toggle,
		RadioGroup,
		InfoBanner
	} from '$lib/components';
	import {
		REQUEST_WATTAGE_OPTIONS,
		NEIGHBORHOOD_OPTIONS,
		TIMEFRAME_OPTIONS
	} from '$lib/types';

	// Form state
	let wattageRange = $state('');
	let neighborhood = $state('');
	let timeframe = $state('');
	let isUrgent = $state(false);
	let hasFuel = $state('');
	let hasCords = $state('');
	let notes = $state('');
	let agreed = $state(false);

	// Form errors
	let errors = $state<Record<string, string>>({});
	let loading = $state(false);
	let submitError = $state('');

	function validate(): boolean {
		errors = {};

		if (!wattageRange) errors.wattageRange = 'Select how much power you need';
		if (!neighborhood) errors.neighborhood = 'Select your neighborhood';
		if (!timeframe) errors.timeframe = 'Select when you need it';
		if (!hasFuel) errors.hasFuel = 'Please answer this question';
		if (!hasCords) errors.hasCords = 'Please answer this question';
		if (!agreed) errors.agreed = 'You must agree before posting';

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validate()) return;

		loading = true;
		submitError = '';

		try {
			const listing = await createListing({
				listing_type: 'request',
				wattage_range: wattageRange as any,
				neighborhood: neighborhood as any,
				timeframe: timeframe as any,
				is_urgent: isUrgent,
				has_fuel: hasFuel === 'yes',
				has_cords: hasCords === 'yes',
				notes: notes || undefined
			});

			goto(`${base}/listing/${listing.id}?created=true`);
		} catch (err: any) {
			console.error('Error creating listing:', err);
			submitError = err.message || 'Failed to create listing. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Request a Generator - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Request generator" backHref={base || '/'} backLabel="Cancel" />
	<SafetyBanner />

	<div class="px-4 py-6 max-w-form mx-auto">
		{#if !$isVerified}
			<InfoBanner>
				You need to verify your account before posting. <a href="{base}/login" class="underline">Verify now</a>
			</InfoBanner>
			<div class="mt-6"></div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="space-y-6">
				<div>
					<Select
						label="How much power do you need?"
						name="wattageRange"
						options={REQUEST_WATTAGE_OPTIONS}
						bind:value={wattageRange}
						required
						error={errors.wattageRange}
						placeholder="Select wattage"
					/>
					<p class="mt-1.5 text-sm text-gray-500">
						Not sure? A fridge + a few lights = about 2,000W
					</p>
				</div>

				<Select
					label="Your neighborhood"
					name="neighborhood"
					options={NEIGHBORHOOD_OPTIONS}
					bind:value={neighborhood}
					required
					error={errors.neighborhood}
					placeholder="Select neighborhood"
				/>

				<Select
					label="When do you need it by?"
					name="timeframe"
					options={TIMEFRAME_OPTIONS}
					bind:value={timeframe}
					required
					error={errors.timeframe}
					placeholder="Select timeframe"
				/>

				<Toggle name="isUrgent" bind:checked={isUrgent}>
					This is urgent
					{#snippet helper()}
						Medical equipment, elderly, young children
					{/snippet}
				</Toggle>
				{#if isUrgent}
					<p class="text-sm text-amber-600 -mt-2">
						Only use if someone's health or safety depends on power.
					</p>
				{/if}

				<RadioGroup
					label="Do you have fuel?"
					name="hasFuel"
					options={[
						{ value: 'yes', label: 'Yes' },
						{ value: 'no', label: 'No' }
					]}
					bind:value={hasFuel}
					error={errors.hasFuel}
				/>

				<RadioGroup
					label="Do you have extension cords?"
					name="hasCords"
					options={[
						{ value: 'yes', label: 'Yes' },
						{ value: 'no', label: 'No' }
					]}
					bind:value={hasCords}
					error={errors.hasCords}
				/>

				<Textarea
					label="Notes (optional)"
					name="notes"
					bind:value={notes}
					placeholder="Need to keep insulin cold."
					maxlength={200}
				/>
			</div>

			<div class="mt-8 pt-6 border-t border-gray-200">
				<Checkbox name="agreed" bind:checked={agreed} error={!!errors.agreed}>
					I understand this app does not provide, deliver, or guarantee equipment.
					I am borrowing at my own risk.
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
				<Button type="submit" disabled={loading || !$isVerified}>
					{loading ? 'Posting...' : 'Post request'}
				</Button>
			</div>
		</form>
	</div>
</div>
