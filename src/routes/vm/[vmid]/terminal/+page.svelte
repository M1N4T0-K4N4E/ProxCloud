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

	onMount(async () => {
		if (browser && vncProxy) {
			try {
				vncStatus = 'Connecting...';
				console.log("NoVNC Init Start for VM:", vmid);
				
				// Dynamic import inside try-catch to catch bundling errors
				// @ts-ignore
				const module = await import('@novnc/novnc/lib/rfb.js');
				const RFB = module.default;

				if (!screenContainer) {
					console.error("NoVNC: screenContainer not found");
					vncStatus = 'Internal UI Error';
					return;
				}

				const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
				// Connect to our backend proxy on port 3000
				const wsUrl = `${protocol}//${window.location.hostname}:3000/api/vnc/ws?vmid=${vmid}&port=${vncProxy.port}&vncticket=${encodeURIComponent(vncProxy.ticket)}`;
				
				console.log("NoVNC Connecting to:", wsUrl);
				
				rfb = new RFB(screenContainer, wsUrl, {
					credentials: { password: vncProxy.ticket }
				});
				
				rfb.addEventListener('connect', () => { 
					vncStatus = 'Connected'; 
					console.log("NoVNC: Connected");
				});
				
				rfb.addEventListener('disconnect', (e: any) => { 
					vncStatus = 'Disconnected'; 
					console.log("NoVNC: Disconnected", e);
				});
				
				rfb.scaleViewport = true;
				rfb.resizeSession = true;
			} catch (err: any) {
				console.error("NoVNC Initialization Error:", err);
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

<div class="container">
	<div class="header">
		<h1>Terminal: Virtual Machine {vmid}</h1>
		<div class="header-actions">
			<span class="status-badge {vncStatus.toLowerCase()}">{vncStatus}</span>
			<a href={`/vm/${vmid}`} class="btn">Back to VM</a>
		</div>
	</div>

	<div class="terminal-layout">
		<div class="card vnc-card full-width">
			<h2>VNC Console</h2>
			
			{#if error}
				<div class="alert error">{error}</div>
			{:else if vncProxy}
				<div class="vnc-container" bind:this={screenContainer}>
					<!-- NoVNC Canvas will be injected here -->
					{#if vncStatus !== 'Connected'}
						<div class="vnc-overlay">
							<p>{vncStatus}</p>
						</div>
					{/if}
				</div>
			{:else}
				<p>Loading VNC details...</p>
			{/if}
		</div>

		<div class="card ssh-card full-width">
			<h2>SSH Access</h2>
			<p>
				If your VM has an OS installed with an SSH server enabled, you can connect using your
				preferred terminal client natively:
			</p>
			<div class="code-block">
				<code>ssh user@&lt;VM_IP_ADDRESS&gt;</code>
			</div>
			<p class="note"><strong>Future Feature:</strong> Web-based SSH via xTerm.js will be available soon.</p>
		</div>
	</div>
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
	h2 {
		margin-top: 0;
		color: #e05d44;
		margin-bottom: 1.5rem;
		border-bottom: 2px solid #f1f3f5;
		padding-bottom: 0.5rem;
	}

	.split-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	@media (max-width: 768px) {
		.split-layout {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid #eee;
	}

	.code-block {
		background: #1e1e1e;
		color: #d4d4d4;
		padding: 1rem;
		border-radius: 6px;
		font-family: monospace;
		margin: 1rem 0;
		overflow-x: auto;
	}
	.code-block.wrap {
		word-break: break-all;
		white-space: pre-wrap;
	}

	.instructions {
		margin-top: 1.5rem;
		padding-left: 1.5rem;
		color: #555;
		line-height: 1.6;
	}

	.vnc-details {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin: 1.5rem 0;
	}

	.label {
		font-weight: bold;
		color: #444;
		display: block;
		margin-bottom: 0.5rem;
	}

	.note {
		font-size: 0.9rem;
		color: #666;
		background: #fff8e1;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #ffc107;
	}

	.btn {
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
	
	.header-actions {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.status-badge {
		padding: 0.4rem 1rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: bold;
		text-transform: uppercase;
	}
	.status-badge.connected { background-color: #d4edda; color: #155724; }
	.status-badge.disconnected { background-color: #f8d7da; color: #721c24; }
	.status-badge.connecting { background-color: #fff3cd; color: #856404; }

	.terminal-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.full-width {
		width: 100%;
	}

	.vnc-container {
		position: relative;
		width: 100%;
		height: 600px;
		background: #000;
		border-radius: 6px;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.vnc-overlay {
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.7);
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.2rem;
		font-weight: bold;
		z-index: 10;
	}

	:global(.vnc-container canvas) {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>
