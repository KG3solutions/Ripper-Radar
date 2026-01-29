<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { PageHeader, Button, StatusPill } from '$lib/components';
	import type { Report } from '$lib/types';

	type Tab = 'reports' | 'listings' | 'users';

	let activeTab = $state<Tab>('reports');
	let reports = $state<any[]>([]);
	let stats = $state({
		activeOffers: 0,
		activeRequests: 0,
		confirmedToday: 0,
		completedTotal: 0
	});
	let loading = $state(true);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;

		// Load pending reports
		const { data: reportsData } = await supabase
			.from('reports')
			.select(`
				*,
				reporter:profiles!reports_reporter_id_fkey(display_name),
				reported_user:profiles!reports_reported_user_id_fkey(display_name, is_banned)
			`)
			.eq('status', 'pending')
			.order('created_at', { ascending: false });

		reports = reportsData || [];

		// Load stats
		const today = new Date().toISOString().split('T')[0];

		const [offersResult, requestsResult, confirmedResult, completedResult] = await Promise.all([
			supabase.from('listings').select('id', { count: 'exact' }).eq('is_active', true).eq('listing_type', 'offer'),
			supabase.from('listings').select('id', { count: 'exact' }).eq('is_active', true).eq('listing_type', 'request'),
			supabase.from('conversations').select('id', { count: 'exact' }).eq('status', 'confirmed').gte('updated_at', today),
			supabase.from('conversations').select('id', { count: 'exact' }).eq('status', 'completed')
		]);

		stats = {
			activeOffers: offersResult.count || 0,
			activeRequests: requestsResult.count || 0,
			confirmedToday: confirmedResult.count || 0,
			completedTotal: completedResult.count || 0
		};

		loading = false;
	}

	async function dismissReport(id: string) {
		await supabase
			.from('reports')
			.update({ status: 'dismissed', reviewed_at: new Date().toISOString() })
			.eq('id', id);
		await loadData();
	}

	async function warnUser(reportId: string, userId: string) {
		// In a real app, this would send a warning notification
		await supabase
			.from('reports')
			.update({ status: 'reviewed', reviewed_at: new Date().toISOString() })
			.eq('id', reportId);
		await loadData();
	}

	async function banUser(reportId: string, userId: string) {
		await Promise.all([
			supabase.from('profiles').update({ is_banned: true, ban_reason: 'Violated community guidelines' }).eq('id', userId),
			supabase.from('reports').update({ status: 'reviewed', reviewed_at: new Date().toISOString() }).eq('id', reportId),
			// Deactivate all user's listings
			supabase.from('listings').update({ is_active: false }).eq('user_id', userId)
		]);
		await loadData();
	}

	function formatDate(date: string): string {
		return new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function formatReportReason(reason: string): string {
		const map: Record<string, string> = {
			spam_fake: 'Spam/Fake',
			harassment: 'Harassment',
			payment_request: 'Payment Request',
			no_show: 'No-show',
			safety_concern: 'Safety Concern',
			other: 'Other'
		};
		return map[reason] || reason;
	}
</script>

<svelte:head>
	<title>Admin - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b border-gray-200 px-4 py-3">
		<div class="max-w-content mx-auto">
			<h1 class="text-lg font-semibold text-gray-800">Generator Share Admin</h1>
		</div>
	</header>

	<div class="px-4 py-4 max-w-content mx-auto">
		<!-- Tabs -->
		<div class="flex gap-2 mb-6 overflow-x-auto">
			<button
				type="button"
				class="px-4 py-2 text-base font-medium rounded-lg whitespace-nowrap
							 {activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				onclick={() => (activeTab = 'reports')}
			>
				Reports ({reports.length})
			</button>
			<button
				type="button"
				class="px-4 py-2 text-base font-medium rounded-lg whitespace-nowrap
							 {activeTab === 'listings' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				onclick={() => (activeTab = 'listings')}
			>
				Listings
			</button>
			<button
				type="button"
				class="px-4 py-2 text-base font-medium rounded-lg whitespace-nowrap
							 {activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				onclick={() => (activeTab = 'users')}
			>
				Users
			</button>
		</div>

		{#if loading}
			<div class="py-12 text-center">
				<p class="text-gray-500">Loading...</p>
			</div>
		{:else if activeTab === 'reports'}
			<h2 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
				Pending Reports ({reports.length})
			</h2>

			{#if reports.length === 0}
				<div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
					<p class="text-gray-500">No pending reports</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each reports as report}
						<div class="bg-white border border-gray-200 rounded-lg p-4">
							<div class="flex items-start justify-between mb-3">
								<div>
									<p class="text-base font-medium text-gray-800">Report #{report.id.slice(0, 8)}</p>
									<p class="text-sm text-gray-500">Type: {formatReportReason(report.reason)}</p>
									<p class="text-sm text-gray-500">Reported: {formatDate(report.created_at)}</p>
								</div>
							</div>

							<div class="mb-3 text-sm">
								<p><span class="text-gray-500">Reported user:</span> {report.reported_user?.display_name || 'Unknown'}</p>
								<p><span class="text-gray-500">Reporter:</span> {report.reporter?.display_name || 'Unknown'}</p>
							</div>

							{#if report.details}
								<div class="mb-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
									"{report.details}"
								</div>
							{/if}

							{#if report.reported_user?.is_banned}
								<p class="text-sm text-red-600 mb-3">User is already banned</p>
							{/if}

							<div class="flex flex-wrap gap-2">
								<Button
									variant="secondary"
									size="small"
									fullWidth={false}
									onclick={() => dismissReport(report.id)}
								>
									Dismiss
								</Button>
								<Button
									variant="secondary"
									size="small"
									fullWidth={false}
									onclick={() => warnUser(report.id, report.reported_user_id)}
								>
									Warn user
								</Button>
								<Button
									variant="danger"
									size="small"
									fullWidth={false}
									onclick={() => banUser(report.id, report.reported_user_id)}
									disabled={report.reported_user?.is_banned}
								>
									Ban user
								</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}

		{:else if activeTab === 'listings'}
			<p class="text-gray-500">Listing management coming soon...</p>

		{:else if activeTab === 'users'}
			<p class="text-gray-500">User management coming soon...</p>
		{/if}

		<!-- Stats -->
		<div class="mt-8 pt-6 border-t border-gray-200">
			<h2 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Stats</h2>
			<div class="grid grid-cols-2 gap-4">
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					<p class="text-2xl font-bold text-gray-800">{stats.activeOffers}</p>
					<p class="text-sm text-gray-500">Active offers</p>
				</div>
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					<p class="text-2xl font-bold text-gray-800">{stats.activeRequests}</p>
					<p class="text-sm text-gray-500">Active requests</p>
				</div>
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					<p class="text-2xl font-bold text-gray-800">{stats.confirmedToday}</p>
					<p class="text-sm text-gray-500">Confirmed today</p>
				</div>
				<div class="bg-white border border-gray-200 rounded-lg p-4">
					<p class="text-2xl font-bold text-gray-800">{stats.completedTotal}</p>
					<p class="text-sm text-gray-500">Total completed</p>
				</div>
			</div>
		</div>
	</div>
</div>
