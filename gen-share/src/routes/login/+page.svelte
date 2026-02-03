<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { signInWithEmail, verifyEmailOtp } from '$lib/stores/auth';
	import { Button, Input, PageHeader } from '$lib/components';

	type Step = 'input' | 'code';

	let step = $state<Step>('input');
	let email = $state('');
	let code = $state('');
	let loading = $state(false);
	let error = $state('');
	let resendTimer = $state(0);

	function isValidEmail(e: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
	}

	async function handleSendCode() {
		error = '';
		loading = true;

		try {
			await signInWithEmail(email);
			step = 'code';
			startResendTimer();
		} catch (err: any) {
			console.error('Error sending code:', err);
			// Show actual error for debugging
			const errMsg = err.message || err.error_description || JSON.stringify(err);
			if (errMsg?.includes('rate') || errMsg?.includes('limit')) {
				error = 'Too many attempts. Wait 15 minutes.';
			} else if (errMsg?.includes('not authorized') || errMsg?.includes('not enabled')) {
				error = 'Email auth not configured. Contact support.';
			} else {
				// Show actual error for debugging
				error = `Error: ${errMsg}`;
			}
		} finally {
			loading = false;
		}
	}

	async function handleVerifyCode() {
		error = '';
		loading = true;

		try {
			await verifyEmailOtp(email, code);

			// Small delay to let auth state settle before navigation
			// This prevents "signal aborted" errors from in-flight requests
			await new Promise(resolve => setTimeout(resolve, 100));

			const redirectTo = $page.url.searchParams.get('redirectTo') || base || '/';
			goto(redirectTo);
		} catch (err: any) {
			console.error('Error verifying code:', err);
			// Ignore abort errors - they can happen during auth state changes
			if (err.message?.includes('abort') || err.message?.includes('signal')) {
				// Auth succeeded but request was aborted, try to navigate anyway
				const redirectTo = $page.url.searchParams.get('redirectTo') || base || '/';
				goto(redirectTo);
				return;
			}
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

	let canSubmit = $derived(isValidEmail(email));
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
				Enter your email to continue. We'll send a code to verify it's you.
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
				<div class="mb-6">
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
				We sent a code to {email}
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
					Use a different email
				</button>
			</div>
		{/if}
	</div>
</div>
