<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	export let data;
	export let form;

	let admin;
	let metrics;
	let users;
	let vms;
	let showDeleteModal = false;
	let pendingDeleteVmRef: string | null = null;
	let pendingDeleteProxmoxVmid: string | null = null;
	let pendingDeleteLabel = '';
	let deleteFormEl: HTMLFormElement | null = null;

	$: ({ admin, metrics, users, vms } = data);

	const gb = (bytes: number) => ((bytes || 0) / 1024 / 1024 / 1024).toFixed(1);

	function openDeleteModal(vm: any) {
		pendingDeleteVmRef = String(vm.vmRef || vm.id || vm.vmid || '');
		pendingDeleteProxmoxVmid = String(vm.proxmoxVmid || vm.vmid || vm.vmRef || '');
		pendingDeleteLabel = String(vm.name || vm.proxmoxVmid || vm.vmRef || pendingDeleteVmRef || 'Unknown');
		showDeleteModal = true;
	}

	function submitDelete() {
		showDeleteModal = false;
		deleteFormEl?.requestSubmit();
	}

	function memoryLabel(vm: any) {
		if (!vm) return '0.0 GB';
		const bytes = vm.status === 'running' && Number(vm.memoryUsed || 0) > 0
			? Number(vm.memoryUsed || 0)
			: Number(vm.memoryAllocated || 0);
		return `${gb(bytes)} GB`;
	}

	onMount(() => {
		let stopPolling = false;

		const poll = async () => {
			while (!stopPolling) {
				await invalidate('app:admin-dashboard');
				await new Promise((resolve) => window.setTimeout(resolve, 1000));
			}
		};

		void poll();

		return () => {
			stopPolling = true;
		};
	});
</script>

<svelte:head>
	<title>Admin Dashboard - ProxCloud</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 md:px-6">
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="m-0 text-3xl font-semibold text-slate-800">Admin Dashboard</h1>
			<p class="mt-2 text-sm text-slate-500">Signed in as {admin?.email} ({admin?.role})</p>
		</div>
		<a
			href="/dashboard"
			class="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
		>
			Back to Dashboard
		</a>
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

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Nodes</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{metrics.nodeCount}</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Users</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{metrics.userCount}</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total VMs</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{metrics.totalVMs}</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Running VMs</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{metrics.runningVMs}</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">vCPUs</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{metrics.totalCpus}</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">CPU Load</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{metrics.cpuUsage.toFixed(2)}%</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Memory</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{gb(metrics.totalMemory)} GB</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Used Memory</p>
			<p class="mt-2 text-2xl font-bold text-orange-600">{gb(metrics.usedMemory)} GB</p>
		</div>
	</div>

	<div class="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-5 py-4">
			<h2 class="m-0 text-lg font-semibold text-slate-800">User Resource Usage</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full border-collapse text-sm">
				<thead class="bg-slate-50 text-left text-slate-600">
					<tr>
						<th class="px-5 py-3 font-semibold">Email</th>
						<th class="px-5 py-3 font-semibold">Role</th>
						<th class="px-5 py-3 font-semibold">VMs</th>
						<th class="px-5 py-3 font-semibold">Running</th>
						<th class="px-5 py-3 font-semibold">vCPUs</th>
						<th class="px-5 py-3 font-semibold">Memory Allocated</th>
						<th class="px-5 py-3 font-semibold">Memory Used</th>
					</tr>
				</thead>
				<tbody>
					{#if users.length === 0}
						<tr>
							<td colspan="7" class="px-5 py-6 text-center text-slate-500">No users found.</td>
						</tr>
					{:else}
						{#each users as u}
							<tr class="border-t border-slate-100">
								<td class="px-5 py-3 text-slate-800">{u.email || u.id}</td>
								<td class="px-5 py-3">
									<span class={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
										{u.role}
									</span>
								</td>
								<td class="px-5 py-3 text-slate-700">{u.vmCount}</td>
								<td class="px-5 py-3 text-slate-700">{u.runningVMs}</td>
								<td class="px-5 py-3 text-slate-700">{u.cpusAllocated}</td>
								<td class="px-5 py-3 text-slate-700">{gb(u.memoryAllocated)} GB</td>
								<td class="px-5 py-3 text-slate-700">{gb(u.memoryUsed)} GB</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<div class="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-5 py-4">
			<h2 class="m-0 text-lg font-semibold text-slate-800">All Virtual Machines</h2>
		</div>
		{#if !vms || vms.length === 0}
			<div class="px-5 py-6 text-sm text-slate-500">No VMs found.</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each vms as vm}
					<div class="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
						<div>
							<div class="font-semibold text-slate-800">{vm.name}</div>
							<div class="text-sm text-slate-500">
								Owner: {vm.ownerEmail} | Ref: {vm.vmRef} | Proxmox VMID: {vm.proxmoxVmid}
							</div>
							<div class="text-sm text-slate-500">
								vCPU: {vm.vcpus ?? 0} | Memory: {memoryLabel(vm)}
							</div>
						</div>
						<div class="flex items-center gap-3">
							<span
								class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
									vm.status === 'running'
										? 'bg-emerald-100 text-emerald-800'
										: vm.status === 'stopped'
											? 'bg-rose-100 text-rose-800'
											: 'bg-slate-200 text-slate-700'
								}`}
							>
								{vm.status}
							</span>
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
		{/if}
	</div>

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
