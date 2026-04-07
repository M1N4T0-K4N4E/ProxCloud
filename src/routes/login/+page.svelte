<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { env as publicEnv } from '$env/dynamic/public';

	let loading = $state(false);
	let errorMessage = $state('');

	const supabase = createSupabaseBrowserClient();

	function getRedirectUrl() {
		const baseUrl = publicEnv.PUBLIC_SITE_URL || window.location.origin;
		return new URL('/auth/callback', baseUrl).toString();
	}

	async function signInWithGoogle() {
		loading = true;
		errorMessage = '';

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: getRedirectUrl()
			}
		});

		if (error) {
			errorMessage = error.message;
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In — ProxCloud</title>
	<meta name="description" content="Sign in to ProxCloud to manage your virtual machines" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-[#0f0c29] via-[#1a1a3e] to-[#24243e] px-4 py-10 font-[Inter]">
	<div class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 animate-pulse rounded-full bg-indigo-500/30 blur-3xl"></div>
	<div class="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-fuchsia-500/25 blur-3xl"></div>
	<div class="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-500/20 blur-3xl"></div>

	<div class="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
		<div class="mb-6 text-center">
			<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/40">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M7.5 4.21l4.5 2.6 4.5-2.6M7.5 19.79V14.6L3 12M21 12l-4.5 2.6v5.19"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.5" />
				</svg>
			</div>
			<h1 class="m-0 text-3xl font-extrabold tracking-tight text-white">ProxCloud</h1>
			<p class="mt-1 text-sm text-white/60">Virtual Machine Management Platform</p>
		</div>

		<div class="my-6 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

		{#if errorMessage}
			<div class="mb-5 flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-200" role="alert">
				<svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 shrink-0">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>{errorMessage}</span>
			</div>
		{/if}

		<button
			id="google-signin-btn"
			class="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-md transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
			onclick={signInWithGoogle}
			disabled={loading}
		>
			{#if loading}
				<div class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
				<span>Redirecting...</span>
			{:else}
				<svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				<span>Sign in with Google</span>
			{/if}
		</button>

		<p class="mt-6 text-center text-xs text-white/40">
			Secure authentication powered by <strong>Supabase</strong>
		</p>
	</div>
</div>
