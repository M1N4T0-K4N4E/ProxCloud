<script lang="ts">
	export let data;
	const { vmid, config, status, error } = data;
</script>

<svelte:head>
	<title>VM {vmid} — ProxCloud</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1>Virtual Machine {vmid}</h1>
		<a href="/dashboard" class="btn">Back to Dashboard</a>
	</div>

	{#if error}
		<div class="alert error">{error}</div>
	{:else if config && status}
		<div class="status-banner {status.status}">
			<strong>Status:</strong>
			{status.status.toUpperCase()}
		</div>

		<div class="actions">
			<!-- These actions would normally trigger API endpoints to start/stop the VM -->
			<button class="btn btn-primary" disabled={status.status === 'running'}>Start</button>
			<button class="btn btn-danger" disabled={status.status !== 'running'}>Stop</button>
			<a href={`/vm/${vmid}/terminal`} class="btn btn-dark">Open Terminal (VNC/SSH)</a>
		</div>

		<div class="config-grid">
			<div class="card">
				<h3>General Details</h3>
				<ul>
					<li><strong>Name:</strong> {config.name || 'N/A'}</li>
					<li><strong>Guest OS:</strong> {config.ostype || 'N/A'}</li>
					<li><strong>CPU Cores:</strong> {config.cores || 'N/A'}</li>
					<li><strong>Memory:</strong> {config.memory ? config.memory + ' MB' : 'N/A'}</li>
				</ul>
			</div>

			<div class="card">
				<h3>Hardware</h3>
				<ul>
					<li><strong>Bootdisk:</strong> {config.bootdisk || 'N/A'}</li>
					<li><strong>Network:</strong> {config.net0 || 'N/A'}</li>
					<li><strong>VirtIO SCSI ID:</strong> {config.scsihw || 'N/A'}</li>
					{#if config.scsi0}
						<li><strong>Disk (scsi0):</strong> {config.scsi0}</li>
					{/if}
				</ul>
			</div>

			<div class="card">
				<h3>Performance</h3>
				<ul>
					<li><strong>Current CPU:</strong> {(status.cpu * 100).toFixed(2)}%</li>
					<li><strong>Current RAM:</strong> {((status.mem || 0) / 1024 / 1024).toFixed(0)} MB</li>
					<li>
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

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
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

	.status-banner {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 2rem;
		text-align: center;
		font-size: 1.2rem;
		border: 1px solid transparent;
	}
	.status-banner.running {
		background-color: #d4edda;
		color: #155724;
		border-color: #c3e6cb;
	}
	.status-banner.stopped {
		background-color: #f8d7da;
		color: #721c24;
		border-color: #f5c6cb;
	}
	.status-banner.unknown {
		background-color: #e2e3e5;
		color: #383d41;
		border-color: #d6d8db;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.btn {
		padding: 0.8rem 1.5rem;
		background-color: #f1f3f5;
		color: #333;
		text-decoration: none;
		border-radius: 4px;
		font-weight: bold;
		border: 1px solid #ddd;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}
	.btn:hover:not(:disabled) {
		background-color: #e9ecef;
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn.btn-primary {
		background-color: #28a745;
		color: white;
		border: none;
	}
	.btn.btn-primary:hover:not(:disabled) {
		background-color: #218838;
	}

	.btn.btn-danger {
		background-color: #dc3545;
		color: white;
		border: none;
	}
	.btn.btn-danger:hover:not(:disabled) {
		background-color: #c82333;
	}

	.btn.btn-dark {
		background-color: #343a40;
		color: white;
		border: none;
	}
	.btn.btn-dark:hover:not(:disabled) {
		background-color: #23272b;
	}

	.config-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid #eee;
	}
	.card h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #e05d44;
		border-bottom: 2px solid #f1f3f5;
		padding-bottom: 0.5rem;
	}
	.card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.card li {
		padding: 0.5rem 0;
		border-bottom: 1px dashed #eee;
		color: #555;
	}
	.card li:last-child {
		border-bottom: none;
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
