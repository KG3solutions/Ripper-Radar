<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ThumbsUp, ThumbsDown, Check } from 'lucide-svelte';
	import { getConversation, activeConversation } from '$lib/stores/conversations';
	import { user } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { PageHeader, Button, Input } from '$lib/components';

	let sentiment = $state<'positive' | 'negative' | null>(null);
	let comment = $state('');
	let loading = $state(false);
	let submitted = $state(false);
	let error = $state('');

	let conversationId = $derived($page.params.id);
	let revieweeId = $derived(
		$activeConversation
			? $activeConversation.initiator_id === $user?.id
				? $activeConversation.owner_id
				: $activeConversation.initiator_id
			: null
	);
	let revieweeName = $derived(
		$activeConversation?.other_user?.display_name || 'this user'
	);

	onMount(async () => {
		await getConversation(conversationId, $user?.id || '');

		// Check if already reviewed
		const { data: existing } = await supabase
			.from('reviews')
			.select('id')
			.eq('conversation_id', conversationId)
			.eq('reviewer_id', $user?.id)
			.single();

		if (existing) {
			submitted = true;
		}
	});

	async function handleSubmit() {
		if (!sentiment || !revieweeId) return;

		loading = true;
		error = '';

		try {
			const { error: insertError } = await supabase.from('reviews').insert([
				{
					conversation_id: conversationId,
					reviewee_id: revieweeId,
					sentiment,
					comment: comment.trim() || null
				}
			]);

			if (insertError) throw insertError;

			submitted = true;
		} catch (err: any) {
			console.error('Error submitting review:', err);
			error = 'Failed to submit review. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleSkip() {
		goto('/profile');
	}
</script>

<svelte:head>
	<title>Leave a Review - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<PageHeader title="Leave a review" backHref="/profile" />

	<div class="px-4 py-8 max-w-form mx-auto">
		{#if submitted}
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Check class="w-8 h-8 text-green-600" />
				</div>
				<h2 class="text-xl font-semibold text-gray-800 mb-2">Review submitted</h2>
				<p class="text-base text-gray-500 mb-6">Thanks for helping the community!</p>
				<Button href="/profile" fullWidth={false}>
					Back to profile
				</Button>
			</div>
		{:else}
			<p class="text-base text-gray-600 mb-6">
				How was your experience with {revieweeName}?
			</p>

			<!-- Sentiment buttons -->
			<div class="flex gap-4 mb-6">
				<button
					type="button"
					onclick={() => (sentiment = 'positive')}
					class="
						flex-1 py-6 rounded-lg border-2 text-center transition-colors
						{sentiment === 'positive'
							? 'border-green-600 bg-green-50'
							: 'border-gray-200 bg-white hover:bg-gray-50'}
					"
				>
					<ThumbsUp
						class="w-8 h-8 mx-auto mb-2 {sentiment === 'positive'
							? 'text-green-600'
							: 'text-gray-400'}"
					/>
					<span
						class="text-base font-medium {sentiment === 'positive'
							? 'text-green-700'
							: 'text-gray-700'}"
					>
						Positive
					</span>
				</button>

				<button
					type="button"
					onclick={() => (sentiment = 'negative')}
					class="
						flex-1 py-6 rounded-lg border-2 text-center transition-colors
						{sentiment === 'negative'
							? 'border-red-600 bg-red-50'
							: 'border-gray-200 bg-white hover:bg-gray-50'}
					"
				>
					<ThumbsDown
						class="w-8 h-8 mx-auto mb-2 {sentiment === 'negative'
							? 'text-red-600'
							: 'text-gray-400'}"
					/>
					<span
						class="text-base font-medium {sentiment === 'negative'
							? 'text-red-700'
							: 'text-gray-700'}"
					>
						Negative
					</span>
				</button>
			</div>

			<!-- Comment -->
			<div class="mb-6">
				<label for="comment" class="block text-sm text-gray-700 mb-1.5">
					Short comment (optional)
				</label>
				<input
					type="text"
					id="comment"
					bind:value={comment}
					maxlength="50"
					placeholder="Quick and helpful."
					class="
						w-full h-12 px-4 text-base text-gray-800
						border-2 border-gray-300 rounded bg-white
						focus:border-blue-600 focus:ring-0 focus:outline-none
					"
				/>
				<p class="mt-1 text-sm text-gray-500">50 characters max</p>
			</div>

			{#if error}
				<div class="mb-4 p-3 bg-red-100 border border-red-200 rounded">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			{/if}

			<div class="space-y-3">
				<Button onclick={handleSubmit} disabled={!sentiment || loading}>
					{loading ? 'Submitting...' : 'Submit review'}
				</Button>
				<Button variant="text" onclick={handleSkip}>
					Skip for now
				</Button>
			</div>
		{/if}
	</div>
</div>
