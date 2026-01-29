// Form validation utilities

export function validatePhone(phone: string): string | null {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length < 10) {
		return 'Enter a valid phone number';
	}
	return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
	if (!value || !value.trim()) {
		return `${fieldName} is required`;
	}
	return null;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
	if (value && value.length > max) {
		return `${fieldName} must be ${max} characters or less`;
	}
	return null;
}

export function validateDate(date: string, fieldName: string): string | null {
	if (!date) {
		return `${fieldName} is required`;
	}

	const parsed = new Date(date);
	if (isNaN(parsed.getTime())) {
		return `${fieldName} must be a valid date`;
	}

	if (parsed < new Date()) {
		return `${fieldName} must be in the future`;
	}

	return null;
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
	return input
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.trim();
}

// Format phone number for display
export function formatPhoneDisplay(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length === 10) {
		return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
	}
	if (cleaned.length === 11 && cleaned.startsWith('1')) {
		return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
	}
	return phone;
}

// Format phone number for API (E.164)
export function formatPhoneApi(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length === 10) {
		return `+1${cleaned}`;
	}
	if (cleaned.length === 11 && cleaned.startsWith('1')) {
		return `+${cleaned}`;
	}
	return phone;
}
