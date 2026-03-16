<script lang="ts">
	import { enhance } from '$app/forms';

	export let form;
	let loading = false;

	// Example defaults
	let formData = {
		vmid: 100,
		name: 'test',
		memory: 512,
		cores: 1,
		storage: 'local-lvm',
		diskSize: 5,
		iso: 'local:iso/ubuntu-24.04.4-live-server-amd64.iso'
	};
</script>

<svelte:head>
	<title>Create VM — ProxCloud</title>
	<meta name="description" content="Create a new virtual machine on ProxCloud" />
</svelte:head>

<div class="container">
	<h1>Create VM</h1>

	<!-- Status Messages -->
	{#if form?.success}
		<div class="alert success">
			<strong>Success!</strong> VM creation task started. Task ID: {form.taskId}
		</div>
	{/if}

	{#if form?.error}
		<div class="alert error">
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
		<div class="grid">
			<div class="form-group">
				<label for="vmid">VM ID</label>
				<input type="number" id="vmid" name="vmid" bind:value={formData.vmid} required />
			</div>

			<div class="form-group">
				<label for="name">VM Name</label>
				<input type="text" id="name" name="name" bind:value={formData.name} required />
			</div>

			<div class="form-group">
				<label for="memory">RAM (MB)</label>
				<input type="number" id="memory" name="memory" bind:value={formData.memory} required />
			</div>

			<div class="form-group">
				<label for="cores">CPU Cores</label>
				<input type="number" id="cores" name="cores" bind:value={formData.cores} required />
			</div>

			<div class="form-group">
				<label for="storage">Target Storage</label>
				<select id="storage" name="storage" bind:value={formData.storage}>
					<option value="local-lvm">local-lvm</option>
					<option value="local-zfs">local-zfs</option>
					<option value="ceph">ceph</option>
				</select>
				<small>Target storage for OS disk</small>
			</div>

			<div class="form-group">
				<label for="diskSize">Disk Size (GB)</label>
				<input
					type="number"
					id="diskSize"
					name="diskSize"
					bind:value={formData.diskSize}
					required
				/>
			</div>

			<div class="form-group full-width">
				<label for="iso">ISO Path</label>
				<input
					type="text"
					id="iso"
					name="iso"
					bind:value={formData.iso}
					placeholder="storage:iso/image.iso"
					required
				/>
				<small>Format: <code>storage:iso/filename.iso</code> (e.g., local:iso/ubuntu.iso)</small>
			</div>
		</div>

		<button type="submit" disabled={loading}>
			{#if loading}Creating...{:else}Create VM{/if}
		</button>
	</form>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin-top: 0;
		color: #333;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.full-width {
		grid-column: span 2;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	label {
		font-weight: 600;
		font-size: 0.9rem;
		margin-bottom: 0.4rem;
		color: #555;
	}

	input,
	select {
		padding: 0.6rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	small {
		font-size: 0.8rem;
		color: #888;
		margin-top: 0.2rem;
	}

	button {
		width: 100%;
		padding: 0.8rem;
		background-color: #e05d44; /* Proxmox Orange-ish */
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover {
		background-color: #c04b35;
	}
	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.alert {
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
	.success {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}
	.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}
</style>
