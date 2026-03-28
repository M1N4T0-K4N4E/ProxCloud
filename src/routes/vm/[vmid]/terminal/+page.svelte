<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	const vmid = $derived(data.vmid);
	const vncProxy = $derived(data.vncProxy);
	const error = $derived(data.error);

	let rfb: any = null;
	let screenContainer: HTMLElement | null = $state(null);
	let vncStatus = $state('Disconnected');

	const vncBadgeClass = $derived(
		vncStatus.toLowerCase().startsWith('connected')
			? 'bg-emerald-100 text-emerald-800'
			: vncStatus.toLowerCase().startsWith('connecting')
				? 'bg-amber-100 text-amber-800'
				: 'bg-rose-100 text-rose-800'
	);

	onMount(async () => {
		if (browser && vncProxy) {
			try {
				vncStatus = 'Connecting...';
				console.log('NoVNC Init Start for VM:', vmid);

				// @ts-ignore
				const module = await import('@novnc/novnc/lib/rfb.js');
				const RFB = module.default;

				if (!screenContainer) {
					console.error('NoVNC: screenContainer not found');
					vncStatus = 'Internal UI Error';
					return;
				}

				const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
				const wsUrl = `${protocol}//${window.location.hostname}:3000/api/vnc/ws?vmid=${vmid}&port=${vncProxy.port}&vncticket=${encodeURIComponent(vncProxy.ticket)}`;

				console.log('NoVNC Connecting to:', wsUrl);

				rfb = new RFB(screenContainer, wsUrl, {
					credentials: { password: vncProxy.ticket }
				});

				rfb.addEventListener('connect', () => {
					vncStatus = 'Connected';
					console.log('NoVNC: Connected');
				});

				rfb.addEventListener('disconnect', (e: any) => {
					vncStatus = 'Disconnected';
					console.log('NoVNC: Disconnected', e);
				});

				rfb.scaleViewport = true;
				rfb.resizeSession = true;
			} catch (err: any) {
				console.error('NoVNC Initialization Error:', err);
				vncStatus = 'Error: ' + (err.message || 'Check Console');
			}
		}
	});

	onDestroy(() => {
		if (rfb) {
			rfb.disconnect();
		}
	});
</script>

<svelte:head>
	<title>Terminal VM {vmid} — ProxCloud</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
		<h1 class="m-0 text-3xl font-semibold text-slate-800">Terminal: Virtual Machine {vmid}</h1>
		<div class="flex items-center gap-3">
			<span class={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${vncBadgeClass}`}
				>{vncStatus}</span
			>
			<a
				href={`/vm/${vmid}`}
				class="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
				>Back to VM</a
			>
		</div>
	</div>

	<div class="flex flex-col gap-8">
		<div class="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 class="mb-6 border-b-2 border-slate-100 pb-2 text-xl font-semibold text-orange-600">
				VNC Console
			</h2>

			{#if error}
				<div class="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-800">{error}</div>
			{:else if vncProxy}
				<div
					class="relative flex h-150 w-full items-center justify-center overflow-hidden rounded-md bg-black [&_canvas]:max-h-full [&_canvas]:max-w-full"
					bind:this={screenContainer}
				>
					{#if vncStatus !== 'Connected'}
						<div class="absolute inset-0 z-10 flex items-center justify-center bg-black/70 text-xl font-bold text-white">
							<p>{vncStatus}</p>
						</div>
					{/if}
				</div>
			{:else}
				<p class="text-slate-600">Loading VNC details...</p>
			{/if}
		</div>

		<div class="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 class="mb-6 border-b-2 border-slate-100 pb-2 text-xl font-semibold text-orange-600">SSH Access</h2>
			<p class="text-slate-700">
				If your VM has an OS installed with an SSH server enabled, you can connect using your
				preferred terminal client natively:
			</p>
			<div class="my-4 overflow-x-auto rounded-md bg-slate-900 px-4 py-3 font-mono text-slate-200">
				<code>ssh user@&lt;VM_IP_ADDRESS&gt;</code>
			</div>
			<p class="rounded-md border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-slate-700">
				<strong>Future Feature:</strong> Web-based SSH via xTerm.js will be available soon.
			</p>
		</div>
	</div>
</div>
