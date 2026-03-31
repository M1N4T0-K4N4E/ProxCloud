<script lang="ts">
	import { enhance } from '$app/forms';

	export let form;
	export let data: any;
	let loading = false;
	
	const nodes = data?.nodes || [];
	const nodeOptions = data?.options || {};

	let selectedNode = nodes?.[0]?.name || '';
	$: currentNodeOptions = nodeOptions[selectedNode] || { iso: [], templates: [] };
	$: currentIsos = currentNodeOptions.iso || [];
	$: currentTemplates = currentNodeOptions.templates || [];

	let formData = {
		node: selectedNode,
		name: 'test',
		memory: 512,
		cores: 1,
		storage: 'local-lvm',
		diskSize: 5,
		sourceType: 'iso',
		iso: currentIsos?.[0]?.volid || '',
		templateVmid: currentTemplates?.[0]?.vmid || ''
	};

	$: selectedNode && updateNodeData();

	function updateNodeData() {
		formData.node = selectedNode;
		formData.iso = currentIsos?.[0]?.volid || '';
		formData.templateVmid = currentTemplates?.[0]?.vmid || '';
		formData.storage = 'local-lvm';
	}
</script>

<svelte:head>
	<title>Create VM — ProxCloud</title>
	<meta name="description" content="Create a new virtual machine on ProxCloud" />
</svelte:head>

<div class="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
	<h1 class="mb-6 text-3xl font-semibold text-slate-800">Create VM</h1>

	<!-- Status Messages -->

	{#if form?.error}
		<div class="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-800">
			<strong>Error:</strong>
			{form.message}
		</div>
	{/if}

	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				update();
			};
		}}
	>
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1 md:col-span-2">
				<label for="node" class="text-sm font-semibold text-slate-700">Target Node</label>
				<select
					id="node"
					name="node"
					bind:value={selectedNode}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
					required
				>
					{#each nodes as node}
						<option value={node.name}>{node.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1 md:col-span-2">
				<label for="sourceType" class="text-sm font-semibold text-slate-700">Installation Source</label>
				<select
					id="sourceType"
					name="sourceType"
					bind:value={formData.sourceType}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
				>
					<option value="iso">ISO installation</option>
					<option value="template">Template clone</option>
				</select>
			</div>

			<div class="flex flex-col gap-1">
				<label for="name" class="text-sm font-semibold text-slate-700">VM Name</label>
				<input
					type="text"
					id="name"
					name="name"
					bind:value={formData.name}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
					required
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="memory" class="text-sm font-semibold text-slate-700">RAM (MB)</label>
				<input
					type="number"
					id="memory"
					name="memory"
					bind:value={formData.memory}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
					required
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="cores" class="text-sm font-semibold text-slate-700">CPU Cores</label>
				<input
					type="number"
					id="cores"
					name="cores"
					bind:value={formData.cores}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
					required
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="storage" class="text-sm font-semibold text-slate-700">Target Storage</label>
				<select
					id="storage"
					name="storage"
					bind:value={formData.storage}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
				>
					<option value="local-lvm">local-lvm</option>
					<option value="local-zfs">local-zfs</option>
					<option value="ceph">ceph</option>
				</select>
				<small class="mt-1 text-xs text-slate-500">Target storage for OS disk</small>
			</div>

			<div class="flex flex-col gap-1">
				<label for="diskSize" class="text-sm font-semibold text-slate-700">Disk Size (GB)</label>
				<input
					type="number"
					id="diskSize"
					name="diskSize"
					bind:value={formData.diskSize}
					class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
					required
				/>
			</div>

			{#if formData.sourceType === 'iso'}
				<div class="flex flex-col gap-1 md:col-span-2">
					<label for="iso" class="text-sm font-semibold text-slate-700">ISO Image</label>
					<select
						id="iso"
						name="iso"
						bind:value={formData.iso}
						class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
						required
					>
						{#if currentIsos.length === 0}
							<option value="">No ISO available on {selectedNode}</option>
						{:else}
							{#each currentIsos as isoOption}
								<option value={isoOption.volid}>{isoOption.label}</option>
							{/each}
						{/if}
					</select>
					<small class="mt-1 text-xs text-slate-500"
						>Select an ISO available on {selectedNode} storage</small
					>
				</div>
			{:else}
				<div class="flex flex-col gap-1 md:col-span-2">
					<label for="templateVmid" class="text-sm font-semibold text-slate-700">Template</label>
					<select
						id="templateVmid"
						name="templateVmid"
						bind:value={formData.templateVmid}
						class="rounded-md border-slate-300 px-3 py-2 text-base focus:border-orange-500 focus:ring-orange-500"
						required
					>
						{#if currentTemplates.length === 0}
							<option value="">No template available on {selectedNode}</option>
						{:else}
							{#each currentTemplates as templateOption}
								<option value={templateOption.vmid}>{templateOption.label}</option>
							{/each}
						{/if}
					</select>
					<small class="mt-1 text-xs text-slate-500"
						>Clone a new VM from an existing Proxmox template</small
					>
				</div>
			{/if}
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-md bg-orange-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
		>
			{#if loading}Creating...{:else}Create VM{/if}
		</button>
	</form>
</div>
