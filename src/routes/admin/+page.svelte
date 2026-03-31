<script lang="ts">
	export let data;

	let admin;
	let metrics;
	let users;

	$: ({ admin, metrics, users } = data);

	const gb = (bytes: number) => ((bytes || 0) / 1024 / 1024 / 1024).toFixed(1);
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
</div>
