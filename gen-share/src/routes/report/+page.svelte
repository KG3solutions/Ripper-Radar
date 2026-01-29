<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Check } from 'lucide-svelte';
	import { supabase } from '$lib/supabase';
	import { user } from '$lib/stores/auth';
	import { PageHeader, Button, Checkbox, Textarea } from '$lib/components';
	import { REPORT_REASON_OPTIONS } from '$lib/types';

	let reason = $state('');
	let details = $state('');
	let blockUser = $state(false);
	let loading = $state(false);
	let submitted = $state(false);
	let error = $state('');

	let listingId = $derived($page.url.searchParams.get('listing'));
	let userId = $derived($page.url.searchParams.get('user'));

	async function handleSubmit() {
		if (!reason) return;

		loading = true;
		error = '';

		try {
			const reportData: any = {
				reason,
				details: details.trim() || null,
				block_user: blockUser
			};

			if (listingId) {
				// Get listing owner
				const { data: listing } = await supabase
					.from('listings')
					.select('user_id')
					.eq('id', listingId)
					.single();

				reportData.reported_listing_id = listingId;
				if (listing) {
					reportData.reported_user_id = listing.user_id;
				}
			} else if (userId) {
				reportData.reported_user_id = userId;
			}

			const { error: insertError } = await supabase.from('reports').insert([reportData]);

			if (insertError) throw insertError;

			// Block user if requested
			if (blockUser && reportData.reported_user_id) {
				await supabase.from('blocks').insert([
					{ blocked_id: reportData.reported_user_id }
				]);
			}

			submitted = true;
		} catch (err: any) {
			console.error('Error submitting report:', err);
			error = 'Failed to submit report. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Report - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Report" backHref="javascript:history.back()" backLabel="Cancel" />

	<div class="px-4 py-6 max-w-form mx-auto">
		{#if submitted}
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Check class="w-8 h-8 text-green-600" />
				</div>
				<h2 class="text-xl font-semibold text-gray-800 mb-2">Report submitted</h2>
				<p class="text-base text-gray-500 mb-6">
					We'll review this within 24 hours. Thanks for helping keep the community safe.
				</p>
				<Button href="/" fullWidth={false}>
					Done
				</Button>
			</div>
		{:else}
			<p class="text-base text-gray-700 mb-6">
				Report this user or listing
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="mb-6">
					<p class="text-sm text-gray-700 mb-3">What's the problem?</p>
					<div class="space-y-2">
						{#each REPORT_REASON_OPTIONS as option}
							<label
								class="
									flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
									transition-colors
									{reason === option.value
										? 'border-blue-600 bg-blue-50'
										: 'border-gray-200 bg-white hover:bg-gray-50'}
								"
							>
								<input
									type="radio"
									name="reason"
									value={option.value}
									bind:group={reason}
									class="w-5 h-5 text-blue-600"
								/>
								<span class="text-base text-gray-800">{option.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<hr class="my-6 border-gray-200" />

				<div class="mb-6">
					<Textarea
						label="Details (optional)"
						name="details"
						bind:value={details}
						placeholder="Tell us more about what happened..."
						maxlength={500}
						rows={4}
					/>
				</div>

				<hr class="my-6 border-gray-200" />

				<div class="mb-6">
					<Checkbox name="blockUser" bind:checked={blockUser}>
						Also block this user
					</Checkbox>
				</div>

				{#if error}
					<div class="mb-4 p-3 bg-red-100 border border-red-200 rounded">
						<p class="text-sm text-red-700">{error}</p>
					</div>
				{/if}

				<Button type="submit" disabled={!reason || loading}>
					{loading ? 'Submitting...' : 'Submit report'}
				</Button>
			</form>
		{/if}
	</div>
</div>
