<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';

	interface Props {
		user: any;
	}

	let { user }: Props = $props();

	const supabase = createSupabaseBrowserClient();

	async function signOut() {
		await supabase.auth.signOut();
		user = null;
		goto('/login');
	}
</script>

<header class="border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur md:px-6">
	{#if user}
		<nav class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
			<ul class="m-0 flex list-none items-center gap-2 p-0">
				<li>
					<a
						href={resolve('/dashboard')}
						class={`inline-flex items-center rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
							page.url.pathname === '/dashboard'
								? 'bg-orange-100 text-orange-700'
								: 'text-slate-700 hover:bg-slate-100 hover:text-orange-700'
						}`}
					>
						Dashboard
					</a>
				</li>
				<li>
					<a
						href={resolve('/create-vm')}
						class={`inline-flex items-center rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
							page.url.pathname.startsWith('/create-vm')
								? 'bg-orange-100 text-orange-700'
								: 'text-slate-700 hover:bg-slate-100 hover:text-orange-700'
						}`}
					>
						Create VM
					</a>
				</li>
			</ul>

			<div class="flex items-center gap-3">
				<span class="hidden text-xs text-slate-500 sm:inline">{user.email}</span>
				<button
					type="button"
					class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
					onclick={signOut}
				>
					Sign Out
				</button>
			</div>
		</nav>
	{/if}
</header>
