<script>
	import '../app.css';
	import { browser } from '$app/environment';
	export let children;
</script>

<!-- Root layout with improved gradient background -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
	{#if browser}
		{@render children()}
	{:else}
		<div id="loading-page" class="flex h-screen w-full items-center justify-center">
			<div class="text-center">
				<div
					class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
				></div>
				<p class="text-gray-600">Loading MedMaster...</p>
			</div>
		</div>
	{/if}
</div>
