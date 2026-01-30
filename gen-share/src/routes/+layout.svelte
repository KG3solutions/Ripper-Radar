<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { initAuth, isAuthenticated, profile } from '$lib/stores/auth';
	import { Menu, X, User } from 'lucide-svelte';

	let { children } = $props();
	let menuOpen = $state(false);
	let mounted = $state(false);
	let initError = $state<string | null>(null);

	onMount(async () => {
		try {
			await initAuth();
			mounted = true;
		} catch (e) {
			initError = e instanceof Error ? e.message : 'Unknown error';
			mounted = true;
		}
	});

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	// Check if current route should show header (accounting for base path)
	let showHeader = $derived.by(() => {
		const path = $page.url.pathname;
		const isLogin = path === `${base}/login` || path === '/login' || path.endsWith('/login');
		const isHome = path === base || path === `${base}/` || path === '/' || path === '/generator-share' || path === '/generator-share/';
		return !isLogin && !isHome;
	});
</script>

<svelte:head>
	<title>Generator Share</title>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Debug info (remove in production) -->
{#if initError}
	<div class="bg-red-100 text-red-800 p-4 text-sm">
		Auth Error: {initError}
	</div>
{/if}

{#if showHeader}
	<header class="bg-white border-b border-gray-200 sticky top-0 z-20">
		<div class="max-w-content mx-auto px-4">
			<div class="flex items-center justify-between h-14">
				<a href="{base}/" class="text-lg font-semibold text-gray-800">
					Generator Share
				</a>

				<!-- Desktop nav -->
				<nav class="hidden sm:flex items-center gap-6">
					<a
						href="{base}/browse/offers"
						class="text-base text-gray-600 hover:text-gray-800 {$page.url.pathname.includes('/browse') ? 'text-gray-800 font-medium' : ''}"
					>
						Browse
					</a>
					<a
						href="{base}/safety"
						class="text-base text-gray-600 hover:text-gray-800 {$page.url.pathname.includes('/safety') ? 'text-gray-800 font-medium' : ''}"
					>
						Safety
					</a>
					{#if $isAuthenticated}
						<a
							href="{base}/profile"
							class="flex items-center gap-2 text-base text-gray-600 hover:text-gray-800 {$page.url.pathname.includes('/profile') ? 'text-gray-800 font-medium' : ''}"
						>
							<User class="w-5 h-5" />
							<span>Profile</span>
						</a>
					{:else}
						<a
							href="{base}/login"
							class="text-base text-blue-600 hover:text-blue-700 font-medium"
						>
							Sign in
						</a>
					{/if}
				</nav>

				<!-- Mobile menu button -->
				<button
					type="button"
					class="sm:hidden p-2 -mr-2 text-gray-600 hover:text-gray-800"
					onclick={toggleMenu}
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
				>
					{#if menuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile nav -->
		{#if menuOpen}
			<nav class="sm:hidden border-t border-gray-200 bg-white">
				<a
					href="{base}/browse/offers"
					class="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50 border-b border-gray-100"
					onclick={closeMenu}
				>
					Browse
				</a>
				<a
					href="{base}/safety"
					class="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50 border-b border-gray-100"
					onclick={closeMenu}
				>
					Safety
				</a>
				{#if $isAuthenticated}
					<a
						href="{base}/profile"
						class="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50"
						onclick={closeMenu}
					>
						Your Profile
					</a>
				{:else}
					<a
						href="{base}/login"
						class="block px-4 py-3 text-base text-blue-600 font-medium hover:bg-gray-50"
						onclick={closeMenu}
					>
						Sign in
					</a>
				{/if}
			</nav>
		{/if}
	</header>
{/if}

<main id="main-content">
	{@render children()}
</main>
