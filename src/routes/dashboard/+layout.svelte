<!-- src/routes/dashboard/+layout.svelte -->
<script>
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import MedMasterLogo from '$lib/medmaster_logo.png';
	// Receive minimal session data from the server load function (only used for auth/Logout)
	export let data;

	// Store the current utility title (default: "Dashboard")
	export let currentUtility = writable('Dashboard');

	// Menu items for the sidebar
	const menuItems = [
		{
			title: 'Dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
			path: '/dashboard'
		},
		{
			title: 'General Health Support',
			icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
			path: '/dashboard/general-health-support'
		},
		{
			title: 'Report Inference',
			icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			// path: '/dashboard/report-ineference'
			path: '#'
		},
		{
			title: 'MBTI Mental Health',
			icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
			path: '/dashboard/mbti-chatbot'
		},
		{
			title: 'Exercise',
			icon: 'M5.5 17a2.5 2.5 0 01-1.344-4.627l.566-.339a2.42 2.42 0 00.614-.31 3.341 3.341 0 00.902-1.185 3.358 3.358 0 003.265.059 3.584 3.584 0 002.5.041 3.354 3.354 0 001.733 1.667 3.342 3.342 0 00.782-.883L15.293 10l3.953 3.953a2 2 0 01-2.121 3.269l-1.346-.508-2.298.669A2.25 2.25 0 0112.12 19H8.309a2.258 2.258 0 01-1.398-.491 2.25 2.25 0 01-1.22-1.376L5.5 17zM3 7a5 5 0 119.544 2.103.5.5 0 01-.421.784h-5.246a.5.5 0 01-.421-.784A5 5 0 013 7z',
			// path: '/dashboard/exercise'
			path: '#'
		},
		{
			title: 'Yoga',
			icon: 'M9.5 1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM5.5 3.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3 10a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-5zm6 0a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-5zm-3-4a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-1z',
			// path: '/dashboard/yoga'
			path: '#'
		},
		{
			title: 'Medical Chat',
			icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
			// path: '/dashboard/chat'
			path: '#'
		}
	];

	let sidebarOpen = false;
	let isLargeScreen = false;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function handleNavClick(item) {
		currentUtility.set(item.title);
		goto(item.path);
		if (!isLargeScreen) {
			sidebarOpen = false;
		}
	}

	async function handleLogout() {
		try {
			// Call the sign-out endpoint to clear the session cookie
			await fetch('/api/auth/signout', { method: 'POST' });
			// Redirect to the home page after logout
			window.location.href = '/';
		} catch (error) {
			console.error('Logout failed', error);
		}
	}

	// Only run on the client side to prevent SSR issues
	onMount(() => {
		// Check initial screen size
		isLargeScreen = window.innerWidth >= 1024;

		// Set up listener for screen size changes
		const handleResize = () => {
			isLargeScreen = window.innerWidth >= 1024;
			if (isLargeScreen) {
				sidebarOpen = true;
			} else {
				sidebarOpen = false;
			}
		};

		window.addEventListener('resize', handleResize);

		// Initialize sidebar state based on screen size
		if (isLargeScreen) {
			sidebarOpen = true;
		}

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

{#if browser}
	<div class="relative flex h-screen w-full bg-gray-50">
		<!-- SIDEBAR (collapsible on mobile) -->
		<aside
			class="fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 lg:relative lg:translate-x-0 {sidebarOpen
				? 'translate-x-0'
				: '-translate-x-full'}"
		>
			<!-- Logo Row -->
			<div class="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4">
				<button on:click={() => goto('/')} class="flex items-center">
					<img src={MedMasterLogo} alt="MedMaster Logo" class="h-10" />
				</button>

				<!-- Mobile Close Button -->
				<button
					on:click={toggleSidebar}
					class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Navigation Links -->
			<nav class="flex flex-1 flex-col overflow-y-auto p-4">
				<div class="space-y-1.5">
					{#each menuItems as item}
						<button
							on:click={() => handleNavClick(item)}
							class="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-700 {$currentUtility ===
							item.title
								? 'bg-blue-50 text-blue-700'
								: ''}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500 {$currentUtility ===
								item.title
									? 'text-blue-500'
									: ''}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
							<span>{item.title}</span>
						</button>
					{/each}
				</div>
			</nav>

			<!-- Logout Button -->
			{#if data && data.session}
				<div class="border-t border-gray-200 p-4">
					<button
						on:click={handleLogout}
						class="flex w-full items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						Logout
					</button>
				</div>
			{/if}
		</aside>

		<!-- MAIN CONTENT AREA -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- TOP BAR -->
			<header
				class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6"
			>
				<!-- Mobile menu button -->
				<button
					on:click={toggleSidebar}
					class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<!-- Page title -->
				<div class="mx-auto lg:mx-0">
					<h1 class="text-xl font-semibold text-gray-800">{$currentUtility}</h1>
				</div>

				<!-- User menu -->
				<div class="flex items-center space-x-4">
					{#if data && data.session && isLargeScreen}
						<button
							on:click={handleLogout}
							class="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
						>
							Logout
						</button>
					{/if}
				</div>
			</header>

			<!-- MAIN CONTENT -->
			<main class="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
				<slot />
			</main>
		</div>
	</div>
{:else}
	<!-- Loading placeholder for SSR -->
	<div class="flex h-screen w-full items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
			></div>
			<p class="text-gray-600">Loading dashboard...</p>
		</div>
	</div>
{/if}
