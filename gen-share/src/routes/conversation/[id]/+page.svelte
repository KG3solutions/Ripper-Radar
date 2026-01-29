<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Send } from 'lucide-svelte';
	import {
		getConversation,
		fetchMessages,
		sendMessage,
		updateConversationStatus,
		subscribeToMessages,
		unsubscribeFromMessages,
		activeConversation,
		messages,
		messagesLoading
	} from '$lib/stores/conversations';
	import { user } from '$lib/stores/auth';
	import {
		PageHeader,
		SafetyBanner,
		Button,
		StatusPill,
		MessageBubble,
		Modal,
		Checkbox
	} from '$lib/components';
	import { formatWattage, formatFuelType, formatNeighborhood } from '$lib/types';

	let newMessage = $state('');
	let sending = $state(false);
	let showConfirmModal = $state(false);
	let showAddressModal = $state(false);
	let address = $state('');
	let messagesContainer: HTMLDivElement;

	// Confirm form state
	let confirmChecks = $state({
		pickup: false,
		returnTime: false,
		fuel: false,
		deposit: false,
		safety: false
	});

	let conversationId = $derived($page.params.id);
	let isOwner = $derived($activeConversation?.owner_id === $user?.id);
	let canConfirm = $derived(
		$activeConversation?.status === 'proposed' && isOwner
	);
	let canComplete = $derived(
		$activeConversation?.status === 'confirmed'
	);
	let canReview = $derived(
		$activeConversation?.status === 'completed'
	);
	let canCancel = $derived(
		$activeConversation?.status === 'proposed' || $activeConversation?.status === 'confirmed'
	);

	let allConfirmChecked = $derived(
		confirmChecks.pickup &&
		confirmChecks.returnTime &&
		confirmChecks.fuel &&
		confirmChecks.deposit &&
		confirmChecks.safety
	);

	onMount(async () => {
		await getConversation(conversationId, $user?.id || '');
		await fetchMessages(conversationId);
		subscribeToMessages(conversationId);

		// Scroll to bottom
		scrollToBottom();
	});

	onDestroy(() => {
		unsubscribeFromMessages(conversationId);
	});

	function scrollToBottom() {
		if (messagesContainer) {
			setTimeout(() => {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}, 100);
		}
	}

	// Scroll when messages change
	$effect(() => {
		$messages;
		scrollToBottom();
	});

	async function handleSendMessage() {
		if (!newMessage.trim() || sending) return;

		sending = true;
		const content = newMessage;
		newMessage = '';

		try {
			await sendMessage(conversationId, content);
		} catch (err) {
			console.error('Error sending message:', err);
			newMessage = content; // Restore on error
		} finally {
			sending = false;
		}
	}

	async function handleConfirm() {
		try {
			await updateConversationStatus(conversationId, 'confirmed');
			showConfirmModal = false;
		} catch (err) {
			console.error('Error confirming:', err);
		}
	}

	async function handleComplete() {
		try {
			await updateConversationStatus(conversationId, 'completed');
			goto(`/review/${conversationId}`);
		} catch (err) {
			console.error('Error completing:', err);
		}
	}

	async function handleCancel() {
		if (!confirm('Cancel this lend? Both parties will be notified. This cannot be undone.')) return;

		try {
			await updateConversationStatus(conversationId, 'cancelled');
		} catch (err) {
			console.error('Error cancelling:', err);
		}
	}

	async function handleShareAddress() {
		if (!address.trim()) return;

		try {
			await sendMessage(conversationId, `My address: ${address}`);
			showAddressModal = false;
			address = '';
		} catch (err) {
			console.error('Error sharing address:', err);
		}
	}
</script>

<svelte:head>
	<title>Conversation - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
	<PageHeader title="Conversation" backHref="/profile" />
	<SafetyBanner />

	{#if $activeConversation}
		<!-- Listing info card -->
		<div class="bg-white border-b border-gray-200 px-4 py-3">
			<div class="max-w-content mx-auto">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-base font-medium text-gray-800">
							{formatWattage($activeConversation.listing?.wattage_range || '')}
							&middot;
							{formatFuelType($activeConversation.listing?.fuel_type || '')}
						</p>
						<p class="text-sm text-gray-500">
							{formatNeighborhood($activeConversation.listing?.neighborhood || '')}
						</p>
					</div>
					<StatusPill status={$activeConversation.status} />
				</div>
			</div>
		</div>

		<!-- Messages -->
		<div
			bind:this={messagesContainer}
			class="flex-1 overflow-y-auto px-4 py-4 messages-container"
		>
			<div class="max-w-content mx-auto">
				{#if $messagesLoading}
					<p class="text-center text-gray-500">Loading messages...</p>
				{:else if $messages.length === 0}
					<p class="text-center text-gray-500">No messages yet. Start the conversation!</p>
				{:else}
					{#each $messages as message (message.id)}
						<MessageBubble
							content={message.content}
							timestamp={message.created_at}
							sent={message.sender_id === $user?.id}
							isSystemMessage={message.is_system_message}
						/>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Action buttons -->
		{#if $activeConversation.status !== 'cancelled'}
			<div class="bg-white border-t border-gray-200 px-4 py-3">
				<div class="max-w-content mx-auto space-y-2">
					<div class="flex gap-2">
						<Button
							variant="secondary"
							size="small"
							fullWidth={false}
							onclick={() => (showAddressModal = true)}
						>
							Share exact address
						</Button>

						{#if canConfirm}
							<Button
								size="small"
								fullWidth={false}
								onclick={() => (showConfirmModal = true)}
							>
								Confirm lend
							</Button>
						{/if}

						{#if canComplete}
							<Button
								size="small"
								fullWidth={false}
								onclick={handleComplete}
							>
								Mark completed
							</Button>
						{/if}

						{#if canReview}
							<Button
								size="small"
								fullWidth={false}
								href="/review/{conversationId}"
							>
								Leave review
							</Button>
						{/if}
					</div>

					{#if canCancel}
						<Button
							variant="danger"
							size="small"
							fullWidth={false}
							onclick={handleCancel}
						>
							Cancel lend
						</Button>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Message input -->
		{#if $activeConversation.status !== 'cancelled'}
			<div class="bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
				<form
					onsubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
					class="max-w-content mx-auto flex gap-2"
				>
					<input
						type="text"
						bind:value={newMessage}
						placeholder="Type a message..."
						class="
							flex-1 h-12 px-4 text-base text-gray-800
							border-2 border-gray-300 rounded bg-white
							focus:border-blue-600 focus:ring-0 focus:outline-none
						"
					/>
					<button
						type="submit"
						disabled={!newMessage.trim() || sending}
						class="
							w-12 h-12 flex items-center justify-center
							bg-blue-600 text-white rounded
							hover:bg-blue-700 active:bg-blue-800
							disabled:bg-gray-300 disabled:cursor-not-allowed
							transition-colors
						"
						aria-label="Send message"
					>
						<Send class="w-5 h-5" />
					</button>
				</form>
			</div>
		{/if}
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-gray-500">Loading conversation...</p>
		</div>
	{/if}
</div>

<!-- Confirm Modal -->
<Modal bind:open={showConfirmModal} title="Confirm this lend">
	<p class="text-base text-gray-600 mb-4">
		Before confirming, make sure you've agreed on these details:
	</p>

	<div class="space-y-3 mb-6">
		<Checkbox name="pickup" bind:checked={confirmChecks.pickup}>
			Pickup plan (where, when)
		</Checkbox>
		<Checkbox name="returnTime" bind:checked={confirmChecks.returnTime}>
			Return time
		</Checkbox>
		<Checkbox name="fuel" bind:checked={confirmChecks.fuel}>
			Fuel expectations (who provides, return full?)
		</Checkbox>
	</div>

	<hr class="my-4 border-gray-200" />

	<div class="mb-6">
		<Checkbox name="deposit" bind:checked={confirmChecks.deposit}>
			Any deposit is handled privately between us. This app is not involved.
		</Checkbox>
	</div>

	<hr class="my-4 border-gray-200" />

	<div class="mb-6">
		<p class="text-sm font-semibold text-red-700 mb-2">SAFETY ACKNOWLEDGEMENT</p>
		<Checkbox name="safety" bind:checked={confirmChecks.safety} error={!confirmChecks.safety}>
			I will NEVER run a generator indoors or in a garage. Carbon monoxide is deadly and odorless.
		</Checkbox>
	</div>

	<div class="space-y-3">
		<Button onclick={handleConfirm} disabled={!allConfirmChecked}>
			Confirm lend
		</Button>
		<Button variant="text" onclick={() => (showConfirmModal = false)}>
			Cancel
		</Button>
	</div>
</Modal>

<!-- Share Address Modal -->
<Modal bind:open={showAddressModal} title="Share your address?">
	<p class="text-base text-gray-600 mb-4">
		This will send your exact address to this person. This app is not responsible for meetups.
	</p>

	<div class="mb-6">
		<label for="address" class="block text-sm text-gray-700 mb-1.5">
			Your address
		</label>
		<textarea
			id="address"
			bind:value={address}
			rows="2"
			placeholder="1234 Main St, Nashville, TN 37206"
			class="
				w-full px-4 py-3 text-base text-gray-800
				border-2 border-gray-300 rounded bg-white
				focus:border-blue-600 focus:ring-0 focus:outline-none
			"
		></textarea>
	</div>

	<div class="space-y-3">
		<Button onclick={handleShareAddress} disabled={!address.trim()}>
			Share address
		</Button>
		<Button variant="text" onclick={() => (showAddressModal = false)}>
			Cancel
		</Button>
	</div>
</Modal>
