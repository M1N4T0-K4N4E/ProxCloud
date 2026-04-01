<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	export let data;
	export let form;

	let metrics;
	let vms;
	let showDeleteModal = false;
	let pendingDeleteVmRef: string | null = null;
	let pendingDeleteProxmoxVmid: string | null = null;
	let pendingDeleteLabel = '';
	let deleteFormEl: HTMLFormElement | null = null;

	$: ({ metrics, vms } = data);
	$: hasRunningVm = Array.isArray(vms) && vms.some((vm: any) => vm?.status === 'running');

	function openDeleteModal(vm: any) {
		pendingDeleteVmRef = String(vm.vmRef || vm.id || vm.vmid || '');
		pendingDeleteProxmoxVmid = String(vm.proxmoxVmid || vm.vmid || vm.vmRef || '');
		pendingDeleteLabel = String(vm.name || vm.proxmoxVmid || vm.vmid || pendingDeleteVmRef || 'Unknown');
		showDeleteModal = true;
	}

	function submitDelete() {
		showDeleteModal = false;
		deleteFormEl?.requestSubmit();
	}

	onMount(() => {
		let stopPolling = false;

		const poll = async () => {
			while (!stopPolling) {
				if (hasRunningVm) {
					await invalidate('app:dashboard');
				}
				await new Promise((resolve) => window.setTimeout(resolve, 3000));
			}
		};

		void poll();

		return () => {
			stopPolling = true;
		};
	});
</script>

<svelte:head>
	<title>Dashboard — ProxCloud</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-8 flex items-center justify-between gap-4">
		<h1 class="m-0 text-3xl font-semibold text-slate-800">Dashboard</h1>
		<a
			href="/create-vm"
			class="inline-flex items-center rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white! no-underline shadow-sm ring-1 ring-orange-700/30 transition hover:bg-orange-700 hover:shadow-md"
			>+ Create VM</a
		>
	</div>

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

	<form method="POST" action="?/delete" bind:this={deleteFormEl}>
		<input type="hidden" name="vmid" value={pendingDeleteVmRef || ''} />
		<input type="hidden" name="proxmoxVmid" value={pendingDeleteProxmoxVmid || ''} />
		<button type="submit" class="hidden" aria-hidden="true" tabindex="-1">Delete VM</button>
	</form>

	{#if metrics}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			<div class="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total VMs</h3>
				<p class="mt-2 text-3xl font-bold text-orange-600">{metrics.totalVMs}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Running VMs</h3>
				<p class="mt-2 text-3xl font-bold text-orange-600">{metrics.runningVMs}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">vCPUs Allocated</h3>
				<p class="mt-2 text-3xl font-bold text-orange-600">{metrics.totalCpus}</p>
			</div>
			<div
				class="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm"
				title="Average over running VMs"
			>
				<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg CPU Load</h3>
				<p class="mt-2 text-3xl font-bold text-orange-600">{metrics.cpuUsage.toFixed(2)}%</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Memory Total</h3>
				<p class="mt-2 text-3xl font-bold text-orange-600">
					{(metrics.totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB
				</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Memory Used</h3>
				<p class="mt-2 text-3xl font-bold text-orange-600">
					{(metrics.usedMemory / 1024 / 1024 / 1024).toFixed(1)} GB
				</p>
			</div>
		</div>
	{:else}
		<div class="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-800">
			Failed to load metrics. The backend might be unavailable.
		</div>
	{/if}

	<h2 class="mb-6 mt-12 text-2xl font-semibold text-slate-800">Your Virtual Machines</h2>
	{#if vms && vms.length > 0}
		<div class="flex flex-col gap-4">
			{#each vms as vm}
				<div
					class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center md:justify-between"
				>
					<div class="vm-info">
						<h4 class="mb-1 text-xl font-semibold text-slate-900">
							<a href={`/vm/${vm.vmRef || vm.id || vm.vmid}`} class="text-inherit no-underline hover:underline"
								>{vm.name}</a
							>
						</h4>
						<span class="text-sm text-slate-500"
							>VMID: {vm.proxmoxVmid || vm.vmid} | Memory: {vm.maxmem
								? (vm.maxmem / 1024 / 1024 / 1024).toFixed(1) + ' GB'
								: 'N/A'}</span
						>
					</div>
					<div class="flex items-center gap-3">
						<div
							class={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
								vm.status === 'running'
									? 'bg-emerald-100 text-emerald-800'
									: vm.status === 'stopped'
										? 'bg-rose-100 text-rose-800'
										: 'bg-slate-200 text-slate-700'
							}`}
						>
							{vm.status}
						</div>
						<button
							type="button"
							onclick={() => openDeleteModal(vm)}
							class="rounded-md border border-rose-400 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
			<p class="mb-6 text-slate-600">You haven't created any virtual machines yet.</p>
			<a
				href="/create-vm"
				class="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white! no-underline shadow-sm ring-1 ring-orange-700/30 transition hover:bg-orange-700 hover:shadow-md"
				>Create your first VM</a
			>
		</div>
	{/if}

	{#if showDeleteModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
			<div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-slate-900">Delete This VM?</h3>
				<p class="mt-2 text-sm text-slate-600">
					This will stop and permanently remove <strong>{pendingDeleteLabel}</strong>. This action cannot be undone.
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
