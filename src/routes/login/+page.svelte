<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let loading = $state(false);
	let errorMessage = $state('');

	const supabase = createSupabaseBrowserClient();

	async function signInWithGoogle() {
		loading = true;
		errorMessage = '';

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
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

<div class="login-wrapper">
	<!-- Animated background orbs -->
	<div class="bg-orb orb-1"></div>
	<div class="bg-orb orb-2"></div>
	<div class="bg-orb orb-3"></div>

	<div class="login-card">
		<!-- Logo / Branding -->
		<div class="brand">
			<div class="logo-icon">
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
			<h1>ProxCloud</h1>
			<p class="tagline">Virtual Machine Management Platform</p>
		</div>

		<!-- Divider -->
		<div class="divider"></div>

		<!-- Error message -->
		{#if errorMessage}
			<div class="error-banner" role="alert">
				<svg viewBox="0 0 20 20" fill="currentColor" class="error-icon">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>{errorMessage}</span>
			</div>
		{/if}

		<!-- Sign In Button -->
		<button
			id="google-signin-btn"
			class="google-btn"
			onclick={signInWithGoogle}
			disabled={loading}
		>
			{#if loading}
				<div class="spinner"></div>
				<span>Redirecting...</span>
			{:else}
				<svg class="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

		<p class="footer-text">
			Secure authentication powered by <strong>Supabase</strong>
		</p>
	</div>
</div>

<style>
	/* ========== Login Page Styles ========== */

	.login-wrapper {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%);
		position: relative;
		overflow: hidden;
	}

	/* ========== Animated Background Orbs ========== */
	.bg-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.4;
		animation: float 8s ease-in-out infinite;
	}

	.orb-1 {
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, #6366f1, transparent);
		top: -100px;
		right: -100px;
		animation-delay: 0s;
	}

	.orb-2 {
		width: 350px;
		height: 350px;
		background: radial-gradient(circle, #8b5cf6, transparent);
		bottom: -80px;
		left: -80px;
		animation-delay: -3s;
	}

	.orb-3 {
		width: 250px;
		height: 250px;
		background: radial-gradient(circle, #06b6d4, transparent);
		top: 50%;
		left: 60%;
		animation-delay: -5s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(30px, -30px) scale(1.05);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.95);
		}
	}

	/* ========== Card ========== */
	.login-card {
		position: relative;
		z-index: 1;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		padding: 3rem 2.5rem;
		width: 100%;
		max-width: 420px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		animation: cardAppear 0.6s ease-out;
	}

	@keyframes cardAppear {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ========== Branding ========== */
	.brand {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.logo-icon {
		width: 56px;
		height: 56px;
		margin: 0 auto 1rem;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
	}

	.logo-icon svg {
		width: 32px;
		height: 32px;
	}

	.brand h1 {
		font-size: 1.75rem;
		font-weight: 800;
		color: #ffffff;
		margin: 0 0 0.35rem;
		letter-spacing: -0.02em;
	}

	.tagline {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.5);
		margin: 0;
		font-weight: 400;
	}

	/* ========== Divider ========== */
	.divider {
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			rgba(255, 255, 255, 0.15),
			transparent
		);
		margin: 1.5rem 0;
	}

	/* ========== Error ========== */
	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 12px;
		padding: 0.75rem 1rem;
		margin-bottom: 1.25rem;
		color: #fca5a5;
		font-size: 0.85rem;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.error-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	/* ========== Google Button ========== */
	.google-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		background: rgba(255, 255, 255, 0.95);
		border: none;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 600;
		font-family: 'Inter', sans-serif;
		color: #1f2937;
		cursor: pointer;
		transition: all 0.25s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.google-btn:hover:not(:disabled) {
		background: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	.google-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.google-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.google-logo {
		width: 20px;
		height: 20px;
	}

	/* ========== Spinner ========== */
	.spinner {
		width: 20px;
		height: 20px;
		border: 2.5px solid rgba(99, 102, 241, 0.2);
		border-top-color: #6366f1;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ========== Footer Text ========== */
	.footer-text {
		text-align: center;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.3);
		margin: 1.5rem 0 0;
	}

	.footer-text strong {
		color: rgba(255, 255, 255, 0.5);
		font-weight: 600;
	}

	/* ========== Responsive ========== */
	@media (max-width: 480px) {
		.login-card {
			margin: 1rem;
			padding: 2rem 1.5rem;
		}
	}
</style>
