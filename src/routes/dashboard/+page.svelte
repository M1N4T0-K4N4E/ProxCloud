<script lang="ts">
	export let data;
	const { metrics, vms } = data;
</script>

<svelte:head>
	<title>Dashboard — ProxCloud</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1>Dashboard</h1>
		<a href="/create-vm" class="btn btn-primary">+ Create VM</a>
	</div>

	{#if metrics}
		<div class="metrics-grid">
			<div class="card">
				<h3>Total VMs</h3>
				<p class="value">{metrics.totalVMs}</p>
			</div>
			<div class="card">
				<h3>Running VMs</h3>
				<p class="value">{metrics.runningVMs}</p>
			</div>
			<div class="card">
				<h3>vCPUs Allocated</h3>
				<p class="value">{metrics.totalCpus}</p>
			</div>
			<div class="card" title="Average over running VMs">
				<h3>Avg CPU Load</h3>
				<p class="value">{metrics.cpuUsage.toFixed(2)}%</p>
			</div>
			<div class="card">
				<h3>Memory Total</h3>
				<p class="value">{(metrics.totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB</p>
			</div>
			<div class="card">
				<h3>Memory Used</h3>
				<p class="value">{(metrics.usedMemory / 1024 / 1024 / 1024).toFixed(1)} GB</p>
			</div>
		</div>
	{:else}
		<div class="alert error">Failed to load metrics. The backend might be unavailable.</div>
	{/if}

	<h2>Your Virtual Machines</h2>
	{#if vms && vms.length > 0}
		<div class="vm-list">
			{#each vms as vm}
				<a href={`/vm/${vm.vmid}`} class="vm-item">
					<div class="vm-info">
						<h4>{vm.name}</h4>
						<span class="vmid"
							>VMID: {vm.vmid} | Memory: {vm.maxmem
								? (vm.maxmem / 1024 / 1024 / 1024).toFixed(1) + ' GB'
								: 'N/A'}</span
						>
					</div>
					<div class="vm-status {vm.status}">
						{vm.status}
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>You haven't created any virtual machines yet.</p>
			<a href="/create-vm" class="btn">Create your first VM</a>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		background: transparent;
		padding: 2rem 0;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	h1 {
		margin: 0;
		color: #333;
	}
	h2 {
		margin-top: 3rem;
		margin-bottom: 1.5rem;
		color: #444;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid #eee;
		text-align: center;
	}
	.card h3 {
		margin: 0;
		font-size: 0.85rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.card .value {
		font-size: 2rem;
		font-weight: bold;
		color: #e05d44;
		margin: 0.8rem 0 0;
	}

	.vm-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.vm-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: white;
		padding: 1.2rem 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		border: 1px solid #eee;
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}
	.vm-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
	}

	.vm-info h4 {
		margin: 0 0 0.4rem;
		font-size: 1.2rem;
		color: #222;
	}
	.vmid {
		color: #888;
		font-size: 0.9rem;
	}

	.vm-status {
		padding: 0.4rem 1rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: bold;
		text-transform: uppercase;
	}
	.vm-status.running {
		background-color: #d4edda;
		color: #155724;
	}
	.vm-status.stopped {
		background-color: #f8d7da;
		color: #721c24;
	}
	.vm-status.unknown {
		background-color: #e2e3e5;
		color: #383d41;
	}

	.empty-state {
		background: white;
		border: 1px dashed #ccc;
		border-radius: 8px;
		padding: 3rem;
		text-align: center;
	}
	.empty-state p {
		color: #666;
		margin-bottom: 1.5rem;
	}

	.btn {
		display: inline-block;
		padding: 0.8rem 1.5rem;
		background-color: #f1f3f5;
		color: #333;
		text-decoration: none;
		border-radius: 4px;
		font-weight: bold;
		border: 1px solid #ddd;
		transition: background 0.2s;
	}
	.btn:hover {
		background-color: #e9ecef;
	}
	.btn.btn-primary {
		background-color: #e05d44;
		color: white;
		border: none;
	}
	.btn.btn-primary:hover {
		background-color: #c04b35;
	}

	.alert {
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
	.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}
</style>
