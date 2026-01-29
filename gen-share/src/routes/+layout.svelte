<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { initAuth, isAuthenticated, profile } from '$lib/stores/auth';
	import { Menu, X, User } from 'lucide-svelte';

	let menuOpen = $state(false);

	onMount(() => {
		initAuth();
	});

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	// Check if current route should show header
	let showHeader = $derived(
		!$page.url.pathname.startsWith('/login') &&
		$page.url.pathname !== '/'
	);
</script>

<svelte:head>
	<title>Generator Share</title>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>

{#if showHeader}
	<header class="bg-white border-b border-gray-200 sticky top-0 z-20">
		<div class="max-w-content mx-auto px-4">
			<div class="flex items-center justify-between h-14">
				<a href="/" class="text-lg font-semibold text-gray-800">
					Generator Share
				</a>

				<!-- Desktop nav -->
				<nav class="hidden sm:flex items-center gap-6">
					<a
						href="/browse/offers"
						class="text-base text-gray-600 hover:text-gray-800 {$page.url.pathname.includes('/browse') ? 'text-gray-800 font-medium' : ''}"
					>
						Browse
					</a>
					<a
						href="/safety"
						class="text-base text-gray-600 hover:text-gray-800 {$page.url.pathname === '/safety' ? 'text-gray-800 font-medium' : ''}"
					>
						Safety
					</a>
					{#if $isAuthenticated}
						<a
							href="/profile"
							class="flex items-center gap-2 text-base text-gray-600 hover:text-gray-800 {$page.url.pathname === '/profile' ? 'text-gray-800 font-medium' : ''}"
						>
							<User class="w-5 h-5" />
							<span>Profile</span>
						</a>
					{:else}
						<a
							href="/login"
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
					href="/browse/offers"
					class="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50 border-b border-gray-100"
					onclick={closeMenu}
				>
					Browse
				</a>
				<a
					href="/safety"
					class="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50 border-b border-gray-100"
					onclick={closeMenu}
				>
					Safety
				</a>
				{#if $isAuthenticated}
					<a
						href="/profile"
						class="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50"
						onclick={closeMenu}
					>
						Your Profile
					</a>
				{:else}
					<a
						href="/login"
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
	<slot />
</main>
