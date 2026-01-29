<script lang="ts">
	import { User } from 'lucide-svelte';
	import Badge from './Badge.svelte';
	import type { UserProfile } from '$lib/types';

	interface Props {
		user: UserProfile;
		showJoinDate?: boolean;
	}

	let { user, showJoinDate = true }: Props = $props();

	function formatJoinDate(date: string): string {
		return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}
</script>

<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
	<div class="flex items-start gap-4">
		<div
			class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0"
		>
			<User class="w-6 h-6" />
		</div>

		<div class="flex-1 min-w-0">
			<p class="text-base font-semibold text-gray-800">
				{user.display_name}
			</p>

			<div class="flex flex-wrap gap-2 mt-2">
				{#if user.phone_verified}
					<Badge variant="verified">Verified</Badge>
				{/if}
			</div>

			{#if user.positive_reviews > 0}
				<p class="text-sm text-gray-600 mt-2">
					{user.positive_reviews} positive review{user.positive_reviews === 1 ? '' : 's'}
				</p>
			{/if}

			{#if showJoinDate && user.created_at}
				<p class="text-sm text-gray-500 mt-1">
					Member since {formatJoinDate(user.created_at)}
				</p>
			{/if}
		</div>
	</div>
</div>
