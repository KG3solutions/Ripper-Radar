<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { signInWithPhone, signInWithEmail, verifyOtp, verifyEmailOtp } from '$lib/stores/auth';
	import { Button, Input, PageHeader } from '$lib/components';

	type Step = 'input' | 'code';
	type Method = 'email' | 'phone';

	let step = $state<Step>('input');
	let method = $state<Method>('email');
	let phone = $state('');
	let email = $state('');
	let code = $state('');
	let loading = $state(false);
	let error = $state('');
	let resendTimer = $state(0);

	let formattedPhone = $derived(formatPhoneForDisplay(phone));

	function formatPhoneForDisplay(p: string): string {
		const cleaned = p.replace(/\D/g, '');
		if (cleaned.length === 10) {
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
		}
		return p;
	}

	function formatPhoneForApi(p: string): string {
		const cleaned = p.replace(/\D/g, '');
		if (cleaned.length === 10) {
			return `+1${cleaned}`;
		}
		return p;
	}

	function isValidEmail(e: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
	}

	async function handleSendCode() {
		error = '';
		loading = true;

		try {
			if (method === 'email') {
				await signInWithEmail(email);
			} else {
				await signInWithPhone(formatPhoneForApi(phone));
			}
			step = 'code';
			startResendTimer();
		} catch (err: any) {
			console.error('Error sending code:', err);
			if (err.message?.includes('rate')) {
				error = 'Too many attempts. Wait 15 minutes.';
			} else {
				error = 'Failed to send code. Please try again.';
			}
		} finally {
			loading = false;
		}
	}

	async function handleVerifyCode() {
		error = '';
		loading = true;

		try {
			if (method === 'email') {
				await verifyEmailOtp(email, code);
			} else {
				await verifyOtp(formatPhoneForApi(phone), code);
			}

			const redirectTo = $page.url.searchParams.get('redirectTo') || base || '/';
			goto(redirectTo);
		} catch (err: any) {
			console.error('Error verifying code:', err);
			if (err.message?.includes('expired')) {
				error = 'Code expired. Request a new one.';
			} else if (err.message?.includes('Invalid')) {
				error = 'Invalid code. Try again.';
			} else {
				error = 'Verification failed. Please try again.';
			}
		} finally {
			loading = false;
		}
	}

	function startResendTimer() {
		resendTimer = 30;
		const interval = setInterval(() => {
			resendTimer--;
			if (resendTimer <= 0) {
				clearInterval(interval);
			}
		}, 1000);
	}

	async function handleResend() {
		if (resendTimer > 0) return;
		await handleSendCode();
	}

	function handleBack() {
		step = 'input';
		code = '';
		error = '';
	}

	function switchMethod(newMethod: Method) {
		method = newMethod;
		error = '';
	}

	let canSubmit = $derived(
		method === 'email'
			? isValidEmail(email)
			: phone.replace(/\D/g, '').length >= 10
	);

	let displayValue = $derived(
		method === 'email' ? email : formattedPhone
	);
</script>

<svelte:head>
	<title>Sign in - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	{#if step === 'code'}
		<PageHeader title="Enter code" backHref="#" backLabel="Back" />
	{:else}
		<PageHeader title="Sign in" />
	{/if}

	<div class="px-4 py-8 max-w-form mx-auto">
		{#if step === 'input'}
			<p class="text-base text-gray-600 mb-6">
				{#if method === 'email'}
					Enter your email to continue. We'll send a code to verify it's you.
				{:else}
					Enter your phone number to continue. We'll send a code to verify it's you.
				{/if}
			</p>

			<!-- Method Toggle -->
			<div class="flex mb-6 bg-gray-100 rounded-lg p-1">
				<button
					type="button"
					class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors {method === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
					onclick={() => switchMethod('email')}
				>
					Email
				</button>
				<button
					type="button"
					class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors {method === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
					onclick={() => switchMethod('phone')}
				>
					Phone
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
				<div class="mb-6">
					{#if method === 'email'}
						<Input
							label="Email address"
							name="email"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							required
							error={error}
							autocomplete="email"
						/>
					{:else}
						<Input
							label="Phone number"
							name="phone"
							type="tel"
							placeholder="(615) 555-0123"
							bind:value={phone}
							required
							error={error}
							autocomplete="tel"
						/>
					{/if}
				</div>

				<Button type="submit" disabled={loading || !canSubmit}>
					{loading ? 'Sending...' : 'Send code'}
				</Button>
			</form>

			<div class="mt-8 pt-6 border-t border-gray-200">
				<p class="text-sm text-gray-500 text-center">
					By continuing, you agree to our
					<a href="{base}/terms" class="text-blue-600 hover:underline">Terms of Use</a>
					and
					<a href="{base}/privacy" class="text-blue-600 hover:underline">Privacy Policy</a>.
				</p>
			</div>

		{:else}
			<p class="text-base text-gray-600 mb-6">
				We sent a code to {displayValue}
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
				<div class="mb-6">
					<label for="code" class="block text-sm text-gray-700 mb-1.5">
						Verification code
					</label>
					<div class="flex gap-2 justify-center">
						<input
							type="text"
							id="code"
							name="code"
							bind:value={code}
							maxlength="6"
							pattern="[0-9]*"
							inputmode="numeric"
							autocomplete="one-time-code"
							class="
								w-full h-14 text-center text-2xl font-mono tracking-widest
								border-2 rounded bg-white
								{error ? 'border-red-600' : 'border-gray-300'}
								focus:border-blue-600 focus:ring-0 focus:outline-none
							"
							placeholder="000000"
						/>
					</div>
					{#if error}
						<p class="mt-2 text-sm text-red-600 text-center" role="alert">
							{error}
						</p>
					{/if}
				</div>

				<Button type="submit" disabled={loading || code.length < 6}>
					{loading ? 'Verifying...' : 'Verify'}
				</Button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-gray-500 mb-2">Didn't get the code?</p>
				<button
					type="button"
					class="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
					disabled={resendTimer > 0}
					onclick={handleResend}
				>
					{resendTimer > 0 ? `Resend code (${resendTimer}s)` : 'Resend code'}
				</button>
			</div>

			<div class="mt-6 text-center">
				<button
					type="button"
					class="text-sm text-gray-500 hover:text-gray-700"
					onclick={handleBack}
				>
					Use a different {method === 'email' ? 'email' : 'number'}
				</button>
			</div>
		{/if}
	</div>
</div>
