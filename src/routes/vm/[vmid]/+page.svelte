<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	export let data;
	export let form;

	let vmid;
	let config;
	let status;
	let diskSize;
	let imageName;
	let error;
	let guestOsLabel = 'N/A';
	let guestOsFullLabel = 'N/A';
	let showDeleteModal = false;
	let deleteFormEl: HTMLFormElement | null = null;

	const OS_TYPE_LABELS: Record<string, string> = {
		l26: 'Linux 2.6 / 3.x / 4.x / 5.x / 6.x Kernel',
		win11: 'Microsoft Windows 11/2022/2025',
		win10: 'Microsoft Windows 10/2016/2019',
		win8: 'Microsoft Windows 8/2012/2012 R2',
		win7: 'Microsoft Windows 7/2008 R2',
		w2k8: 'Microsoft Windows Vista/2008',
		w2k3: 'Microsoft Windows XP/2003',
		solaris: 'Solaris Kernel',
		other: 'Other OS Types'
	};

	const OS_TYPE_SHORT_LABELS: Record<string, string> = {
		l26: 'Linux',
		win11: 'Windows 11/Server',
		win10: 'Windows 10/Server',
		win8: 'Windows 8/Server',
		win7: 'Windows 7/Server',
		w2k8: 'Windows Vista/2008',
		w2k3: 'Windows XP/2003',
		solaris: 'Solaris',
		other: 'Other'
	};

	$: ({ vmid, config, status, diskSize, imageName, error } = data);
	$: guestOsFullLabel = config?.ostype
		? OS_TYPE_LABELS[String(config.ostype)] || String(config.ostype)
		: 'N/A';
	$: guestOsLabel = config?.ostype
		? OS_TYPE_SHORT_LABELS[String(config.ostype)] || String(config.ostype)
		: 'N/A';

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 1000);

		return () => clearInterval(interval);
	});

	function submitDelete() {
		showDeleteModal = false;
		deleteFormEl?.requestSubmit();
	}
</script>

<svelte:head>
	<title>{config?.name || `VM ${vmid}`} — ProxCloud</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-8 flex items-center justify-between gap-4">
		<h1 class="m-0 text-3xl font-semibold text-slate-800">{config?.name || `VM ${vmid}`}</h1>
		<a
			href="/dashboard"
			class="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
			>Back to Dashboard</a
		>
	</div>

	{#if error}
		<div class="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-800">{error}</div>
	{:else if config && status}
		{#if form?.success}
			<div class="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800">
				{form.message}
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-800">
				{form.message}
			</div>
		{/if}

		<div
			class={`mb-8 rounded-md border px-4 py-3 text-center text-lg font-semibold ${
				status.status === 'running'
					? 'border-emerald-300 bg-emerald-50 text-emerald-800'
					: status.status === 'stopped'
						? 'border-rose-300 bg-rose-50 text-rose-800'
						: 'border-slate-300 bg-slate-100 text-slate-700'
			}`}
		>
			<strong>Status:</strong>
			{status.status.toUpperCase()}
		</div>

		<div class="mb-10 flex flex-wrap gap-3">
			<form method="POST" action="?/start">
				<button
					class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={status.status === 'running'}
				>
					Start
				</button>
			</form>
			<form method="POST" action="?/stop">
				<button
					class="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={status.status !== 'running'}
				>
					Stop
				</button>
			</form>
			<form method="POST" action="?/delete" bind:this={deleteFormEl}>
				<button type="submit" class="hidden" aria-hidden="true" tabindex="-1">Delete VM</button>
			</form>
			<button
				type="button"
				onclick={() => (showDeleteModal = true)}
				class="rounded-md border border-rose-500 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white"
			>
				Delete VM
			</button>
			<a
				href={`/vm/${vmid}/terminal`}
				class="inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
				>Open Terminal (VNC/SSH)</a
			>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 border-b-2 border-slate-100 pb-2 text-lg font-semibold text-orange-600">
					General Details
				</h3>
				<ul class="m-0 list-none p-0">
					<li class="border-b border-dashed border-slate-200 py-2 text-slate-600">
						<strong>Name:</strong> {config.name || 'N/A'}
					</li>
					<li class="border-b border-dashed border-slate-200 py-2 text-slate-600">
						<strong>Guest OS:</strong> <span title={guestOsFullLabel}>{guestOsLabel}</span>
					</li>
					<li class="border-b border-dashed border-slate-200 py-2 text-slate-600">
						<strong>CPU Cores:</strong> {config.cores || 'N/A'}
					</li>
					<li class="py-2 text-slate-600">
						<strong>Memory:</strong> {config.memory ? config.memory + ' MB' : 'N/A'}
					</li>
				</ul>
			</div>

			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 border-b-2 border-slate-100 pb-2 text-lg font-semibold text-orange-600">
					Hardware
				</h3>
				<ul class="m-0 list-none p-0">
					<li class="border-b border-dashed border-slate-200 py-2 text-slate-600">
						<strong>Disk Size:</strong> {diskSize || 'N/A'}
					</li>
					<li class="py-2 text-slate-600"><strong>Image Name:</strong> {imageName || 'N/A'}</li>
				</ul>
			</div>

			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 border-b-2 border-slate-100 pb-2 text-lg font-semibold text-orange-600">
					Performance
				</h3>
				<ul class="m-0 list-none p-0">
					<li class="border-b border-dashed border-slate-200 py-2 text-slate-600">
						<strong>Current CPU:</strong> {(status.cpu * 100).toFixed(2)}%
					</li>
					<li class="border-b border-dashed border-slate-200 py-2 text-slate-600">
						<strong>Current RAM:</strong> {((status.mem || 0) / 1024 / 1024).toFixed(0)} MB
					</li>
					<li class="py-2 text-slate-600">
						<strong>Uptime:</strong>
						{status.uptime ? (status.uptime / 3600).toFixed(1) + ' hours' : 'N/A'}
					</li>
				</ul>
			</div>
		</div>
	{:else}
		<p>Loading...</p>
	{/if}

	{#if showDeleteModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
			<div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-slate-900">Delete This VM?</h3>
				<p class="mt-2 text-sm text-slate-600">
					This will permanently remove the VM from Proxmox. This action cannot be undone.
				</p>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onclick={() => (showDeleteModal = false)}
						class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={submitDelete}
						class="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
					>
						Delete VM
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
