<script lang="ts">
	export let data;
	export let form;

	let vmid;
	let config;
	let status;
	let diskSize;
	let imageName;
	let error;

	$: ({ vmid, config, status, diskSize, imageName, error } = data);
</script>

<svelte:head>
	<title>VM {vmid} — ProxCloud</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-8 flex items-center justify-between gap-4">
		<h1 class="m-0 text-3xl font-semibold text-slate-800">Virtual Machine {vmid}</h1>
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
			<form
				method="POST"
				action="?/delete"
				onsubmit={(event) => {
					if (!confirm('Delete this VM permanently? This cannot be undone.')) {
						event.preventDefault();
					}
				}}
			>
				<button class="rounded-md border border-rose-500 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white">
					Delete VM
				</button>
			</form>
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
						<strong>Guest OS:</strong> {config.ostype || 'N/A'}
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
</div>
