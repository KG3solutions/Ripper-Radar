import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Conversation, Message, ConversationStatus } from '$lib/types';

// Conversations state
export const conversations = writable<Conversation[]>([]);
export const conversationsLoading = writable(false);

// Active conversation state
export const activeConversation = writable<Conversation | null>(null);
export const messages = writable<Message[]>([]);
export const messagesLoading = writable(false);

// Fetch user's conversations
export async function fetchConversations(userId: string): Promise<void> {
	conversationsLoading.set(true);

	try {
		const { data, error } = await supabase
			.from('conversations')
			.select(
				`
        *,
        listing:listings (
          id,
          listing_type,
          wattage_range,
          fuel_type,
          neighborhood
        ),
        initiator:profiles!conversations_initiator_id_fkey (
          id,
          display_name,
          phone_verified
        ),
        owner:profiles!conversations_owner_id_fkey (
          id,
          display_name,
          phone_verified
        )
      `
			)
			.or(`initiator_id.eq.${userId},owner_id.eq.${userId}`)
			.order('updated_at', { ascending: false });

		if (error) throw error;

		// Transform to add other_user field
		const transformed = (data || []).map((conv: any) => ({
			...conv,
			other_user: conv.initiator_id === userId ? conv.owner : conv.initiator
		}));

		conversations.set(transformed as Conversation[]);
	} catch (err) {
		console.error('Error fetching conversations:', err);
		conversations.set([]);
	} finally {
		conversationsLoading.set(false);
	}
}

// Get single conversation
export async function getConversation(
	conversationId: string,
	userId: string
): Promise<Conversation | null> {
	const { data, error } = await supabase
		.from('conversations')
		.select(
			`
      *,
      listing:listings (
        *,
        user:profiles!listings_user_id_fkey (
          id,
          display_name,
          phone_verified,
          positive_reviews,
          negative_reviews,
          created_at
        )
      ),
      initiator:profiles!conversations_initiator_id_fkey (
        id,
        display_name,
        phone_verified,
        positive_reviews,
        negative_reviews,
        created_at
      ),
      owner:profiles!conversations_owner_id_fkey (
        id,
        display_name,
        phone_verified,
        positive_reviews,
        negative_reviews,
        created_at
      )
    `
		)
		.eq('id', conversationId)
		.single();

	if (error) {
		console.error('Error fetching conversation:', error);
		return null;
	}

	// Add other_user field
	const conversation = {
		...data,
		other_user: data.initiator_id === userId ? data.owner : data.initiator
	};

	activeConversation.set(conversation as Conversation);
	return conversation as Conversation;
}

// Fetch messages for a conversation
export async function fetchMessages(conversationId: string): Promise<void> {
	messagesLoading.set(true);

	try {
		const { data, error } = await supabase
			.from('messages')
			.select('*')
			.eq('conversation_id', conversationId)
			.order('created_at', { ascending: true });

		if (error) throw error;

		messages.set((data as Message[]) || []);
	} catch (err) {
		console.error('Error fetching messages:', err);
		messages.set([]);
	} finally {
		messagesLoading.set(false);
	}
}

// Send a message
export async function sendMessage(
	conversationId: string,
	content: string,
	isSystemMessage = false
): Promise<Message | null> {
	const { data, error } = await supabase
		.from('messages')
		.insert([
			{
				conversation_id: conversationId,
				content,
				is_system_message: isSystemMessage
			}
		])
		.select()
		.single();

	if (error) {
		console.error('Error sending message:', error);
		return null;
	}

	// Add to local state
	const currentMessages = get(messages);
	messages.set([...currentMessages, data as Message]);

	// Update conversation's updated_at
	await supabase
		.from('conversations')
		.update({ updated_at: new Date().toISOString() })
		.eq('id', conversationId);

	return data as Message;
}

// Start a new conversation
export async function startConversation(
	listingId: string,
	ownerId: string,
	initialMessage: string
): Promise<Conversation | null> {
	// First check if conversation already exists
	const { data: existingSession } = await supabase.auth.getSession();
	const currentUserId = existingSession?.session?.user?.id;

	if (!currentUserId) return null;

	const { data: existing } = await supabase
		.from('conversations')
		.select('id')
		.eq('listing_id', listingId)
		.eq('initiator_id', currentUserId)
		.single();

	if (existing) {
		// Send message to existing conversation
		await sendMessage(existing.id, initialMessage);
		return getConversation(existing.id, currentUserId);
	}

	// Create new conversation
	const { data: conv, error: convError } = await supabase
		.from('conversations')
		.insert([
			{
				listing_id: listingId,
				owner_id: ownerId,
				status: 'proposed'
			}
		])
		.select()
		.single();

	if (convError) {
		console.error('Error creating conversation:', convError);
		return null;
	}

	// Send initial message
	await sendMessage(conv.id, initialMessage);

	return getConversation(conv.id, currentUserId);
}

// Update conversation status
export async function updateConversationStatus(
	conversationId: string,
	status: ConversationStatus
): Promise<void> {
	const { error } = await supabase
		.from('conversations')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('id', conversationId);

	if (error) {
		console.error('Error updating conversation status:', error);
		throw error;
	}

	// Update local state
	const current = get(activeConversation);
	if (current && current.id === conversationId) {
		activeConversation.set({ ...current, status });
	}

	// Add system message
	const statusMessages: Record<ConversationStatus, string> = {
		proposed: 'Conversation started',
		confirmed: 'Lend confirmed. Good luck!',
		completed: 'Lend marked as completed.',
		cancelled: 'Lend cancelled.'
	};

	await sendMessage(conversationId, statusMessages[status], true);
}

// Subscribe to new messages (realtime)
export function subscribeToMessages(conversationId: string) {
	return supabase
		.channel(`messages:${conversationId}`)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'messages',
				filter: `conversation_id=eq.${conversationId}`
			},
			(payload) => {
				const newMessage = payload.new as Message;
				const currentMessages = get(messages);

				// Avoid duplicates
				if (!currentMessages.find((m) => m.id === newMessage.id)) {
					messages.set([...currentMessages, newMessage]);
				}
			}
		)
		.subscribe();
}

// Unsubscribe from messages
export function unsubscribeFromMessages(conversationId: string) {
	supabase.removeChannel(supabase.channel(`messages:${conversationId}`));
}
