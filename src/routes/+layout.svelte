<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';

	let { children, data } = $props();
</script>

<div class="flex min-h-screen flex-col">
	{#if data?.session}
		<Header user={data.user} />
	{/if}
	<main class="flex w-full flex-1 flex-col box-border">{@render children()}</main>
</div>
