<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signInWithPhone, verifyOtp } from '$lib/stores/auth';
	import { Button, Input, PageHeader } from '$lib/components';

	type Step = 'phone' | 'code';

	let step = $state<Step>('phone');
	let phone = $state('');
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

	async function handleSendCode() {
		error = '';
		loading = true;

		try {
			await signInWithPhone(formatPhoneForApi(phone));
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
			await verifyOtp(formatPhoneForApi(phone), code);

			const redirectTo = $page.url.searchParams.get('redirectTo') || '/';
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
		step = 'phone';
		code = '';
		error = '';
	}
</script>

<svelte:head>
	<title>Sign in - Generator Share</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	{#if step === 'code'}
		<PageHeader title="Enter code" backHref="#" backLabel="Back" />
	{:else}
		<PageHeader title="Verify your phone" />
	{/if}

	<div class="px-4 py-8 max-w-form mx-auto">
		{#if step === 'phone'}
			<p class="text-base text-gray-600 mb-6">
				Enter your phone number to continue. We'll send a code to verify it's you.
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
				<div class="mb-6">
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
				</div>

				<Button type="submit" disabled={loading || phone.replace(/\D/g, '').length < 10}>
					{loading ? 'Sending...' : 'Send code'}
				</Button>
			</form>

			<div class="mt-8 pt-6 border-t border-gray-200">
				<p class="text-sm text-gray-500 text-center">
					By continuing, you agree to our
					<a href="/terms" class="text-blue-600 hover:underline">Terms of Use</a>
					and
					<a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</a>.
				</p>
			</div>

		{:else}
			<p class="text-base text-gray-600 mb-6">
				We sent a code to {formattedPhone}
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
					Use a different number
				</button>
			</div>
		{/if}
	</div>
</div>
