// User types
export interface UserProfile {
	id: string;
	display_name: string;
	phone_verified: boolean;
	phone_number?: string;
	created_at: string;
	updated_at: string;
	positive_reviews: number;
	negative_reviews: number;
	is_banned: boolean;
	ban_reason?: string;
}

// Listing types
export type ListingType = 'offer' | 'request';

export type GeneratorType = 'portable' | 'inverter' | 'standby' | 'other';

export type FuelType = 'gasoline' | 'propane' | 'dual_fuel' | 'solar_battery' | 'other';

export type WattageRange =
	| 'under_2000'
	| '2000_3500'
	| '3500_5000'
	| '5000_7500'
	| '7500_10000'
	| 'over_10000'
	| 'not_sure';

export type Timeframe = 'asap' | 'within_24h' | 'within_2_3_days' | 'flexible';

export type Neighborhood =
	| 'east_nashville'
	| 'germantown'
	| 'the_nations'
	| '12_south'
	| 'sylvan_park'
	| 'inglewood'
	| 'madison'
	| 'donelson'
	| 'bellevue'
	| 'green_hills'
	| 'berry_hill'
	| 'antioch'
	| 'hermitage';

export interface Listing {
	id: string;
	user_id: string;
	listing_type: ListingType;
	generator_type?: GeneratorType;
	wattage_range: string;
	fuel_type: string;
	neighborhood: string;
	available_until?: string;
	timeframe?: string;
	is_urgent: boolean;
	has_fuel?: boolean;
	has_cords?: boolean;
	notes?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	user?: UserProfile;
}

// Conversation types
export type ConversationStatus = 'proposed' | 'confirmed' | 'completed' | 'cancelled';

export interface Conversation {
	id: string;
	listing_id: string;
	initiator_id: string;
	owner_id: string;
	status: ConversationStatus;
	created_at: string;
	updated_at: string;
	listing?: Listing;
	other_user?: UserProfile;
	last_message?: string;
}

export interface Message {
	id: string;
	conversation_id: string;
	sender_id: string;
	content: string;
	is_system_message: boolean;
	created_at: string;
}

// Review types
export type ReviewSentiment = 'positive' | 'negative';

export interface Review {
	id: string;
	conversation_id: string;
	reviewer_id: string;
	reviewee_id: string;
	sentiment: ReviewSentiment;
	comment?: string;
	created_at: string;
}

// Report types
export type ReportReason =
	| 'spam_fake'
	| 'harassment'
	| 'payment_request'
	| 'no_show'
	| 'safety_concern'
	| 'other';

export interface Report {
	id: string;
	reporter_id: string;
	reported_user_id?: string;
	reported_listing_id?: string;
	reason: ReportReason;
	details?: string;
	block_user: boolean;
	status: 'pending' | 'reviewed' | 'dismissed';
	reviewed_by?: string;
	reviewed_at?: string;
	created_at: string;
}

// Option types for forms
export interface SelectOption {
	value: string;
	label: string;
}

export const WATTAGE_OPTIONS: SelectOption[] = [
	{ value: 'under_2000', label: 'Under 2,000W' },
	{ value: '2000_3500', label: '2,000 - 3,500W' },
	{ value: '3500_5000', label: '3,500 - 5,000W' },
	{ value: '5000_7500', label: '5,000 - 7,500W' },
	{ value: '7500_10000', label: '7,500 - 10,000W' },
	{ value: 'over_10000', label: '10,000W+' }
];

export const REQUEST_WATTAGE_OPTIONS: SelectOption[] = [
	...WATTAGE_OPTIONS.slice(0, 4),
	{ value: 'not_sure', label: 'Not sure' }
];

export const GENERATOR_TYPE_OPTIONS: SelectOption[] = [
	{ value: 'portable', label: 'Portable' },
	{ value: 'inverter', label: 'Inverter' },
	{ value: 'standby', label: 'Standby' },
	{ value: 'other', label: 'Other' }
];

export const FUEL_TYPE_OPTIONS: SelectOption[] = [
	{ value: 'gasoline', label: 'Gasoline' },
	{ value: 'propane', label: 'Propane' },
	{ value: 'dual_fuel', label: 'Dual fuel (gas/propane)' },
	{ value: 'solar_battery', label: 'Solar/battery' },
	{ value: 'other', label: 'Other' }
];

export const NEIGHBORHOOD_OPTIONS: SelectOption[] = [
	{ value: 'east_nashville', label: 'East Nashville' },
	{ value: 'germantown', label: 'Germantown' },
	{ value: 'the_nations', label: 'The Nations' },
	{ value: '12_south', label: '12 South' },
	{ value: 'sylvan_park', label: 'Sylvan Park' },
	{ value: 'inglewood', label: 'Inglewood' },
	{ value: 'madison', label: 'Madison' },
	{ value: 'donelson', label: 'Donelson' },
	{ value: 'bellevue', label: 'Bellevue' },
	{ value: 'green_hills', label: 'Green Hills' },
	{ value: 'berry_hill', label: 'Berry Hill' },
	{ value: 'antioch', label: 'Antioch' },
	{ value: 'hermitage', label: 'Hermitage' }
];

export const TIMEFRAME_OPTIONS: SelectOption[] = [
	{ value: 'asap', label: 'As soon as possible' },
	{ value: 'within_24h', label: 'Within 24 hours' },
	{ value: 'within_2_3_days', label: 'Within 2-3 days' },
	{ value: 'flexible', label: 'Flexible' }
];

export const REPORT_REASON_OPTIONS: SelectOption[] = [
	{ value: 'spam_fake', label: 'Spam or fake listing' },
	{ value: 'harassment', label: 'Harassment or threats' },
	{ value: 'payment_request', label: 'Asking for payment through app' },
	{ value: 'no_show', label: 'No-show or dishonest' },
	{ value: 'safety_concern', label: 'Safety concern' },
	{ value: 'other', label: 'Other' }
];

// Helper functions
export function formatWattage(value: string): string {
	const option = [...WATTAGE_OPTIONS, ...REQUEST_WATTAGE_OPTIONS].find((o) => o.value === value);
	return option?.label || value;
}

export function formatFuelType(value: string): string {
	const option = FUEL_TYPE_OPTIONS.find((o) => o.value === value);
	return option?.label || value;
}

export function formatGeneratorType(value: string): string {
	const option = GENERATOR_TYPE_OPTIONS.find((o) => o.value === value);
	return option?.label || value;
}

export function formatNeighborhood(value: string): string {
	const option = NEIGHBORHOOD_OPTIONS.find((o) => o.value === value);
	return option?.label || value;
}

export function formatTimeframe(value: string): string {
	const option = TIMEFRAME_OPTIONS.find((o) => o.value === value);
	return option?.label || value;
}
