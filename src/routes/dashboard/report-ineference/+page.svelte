<script>
	import axios from 'axios';
	import { marked } from 'marked';

	let file = null;
	let language = 'en'; // Default language is English ("hi" for Hindi)
	let generatedInference = '';
	let generatedInferenceHtml = '';
	let isLoading = false;
	let error = '';

	// Convert the generated inference to HTML
	$: {
		let text = generatedInference;
		if (language === 'hi') {
			text = text.replace(/[–—]/g, '-');
		}
		generatedInferenceHtml = marked(text, { breaks: true });
	}

	async function handleFileUpload() {
		if (!file) {
			error = 'Please upload a file (PNG, JPEG, or PDF).';
			return;
		}
		// Clear previous results and errors.
		generatedInference = '';
		error = '';
		isLoading = true;

		const formData = new FormData();
		formData.append('file', file);
		formData.append('language', language);

		try {
			const response = await axios.post('/api/report-inference', formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			generatedInference = response.data.result;
		} catch (err) {
			console.error(err);
			error = 'An error occurred while generating the inference.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-8">
	<!-- Header Section with Language Toggle -->
	<div
		class="mb-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg"
	>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center">
				<span
					class="mr-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-inner backdrop-blur-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</span>
				<div>
					<h1 class="text-2xl font-bold">Report Inference Analyzer</h1>
					<p class="text-blue-100">Upload your medical reports for AI-powered analysis</p>
				</div>
			</div>

			<div
				class="inline-flex items-center rounded-full bg-white/10 p-1 shadow-inner backdrop-blur-sm"
			>
				<button
					class="rounded-full px-4 py-2 text-sm font-medium transition-colors {language === 'en'
						? 'bg-white text-blue-700 shadow'
						: 'text-white hover:bg-white/10'}"
					on:click={() => (language = 'en')}
				>
					English
				</button>
				<button
					class="rounded-full px-4 py-2 text-sm font-medium transition-colors {language === 'hi'
						? 'bg-white text-blue-700 shadow'
						: 'text-white hover:bg-white/10'}"
					on:click={() => (language = 'hi')}
				>
					हिंदी
				</button>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- File Upload Section -->
		<div class="lg:col-span-1">
			<div class="overflow-hidden rounded-xl bg-white shadow-md">
				<div class="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
					<h2 class="flex items-center text-lg font-semibold text-gray-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
						Upload Report
					</h2>
				</div>

				<div class="p-6">
					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700" for="file">
							Upload a PDF file
						</label>
						<div class="mt-2">
							<div
								class="flex max-w-lg justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10"
							>
								<div class="text-center">
									<svg
										class="mx-auto h-12 w-12 text-gray-300"
										stroke="currentColor"
										fill="none"
										viewBox="0 0 48 48"
										aria-hidden="true"
									>
										<path
											d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<div class="mt-4 flex text-sm text-gray-600">
										<label
											for="file"
											class="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
										>
											<span>Upload a file</span>
											<input
												id="file"
												type="file"
												accept=".png,.jpeg,.jpg,.pdf"
												class="sr-only"
												on:change={(e) => {
													file = e.target.files[0];
												}}
											/>
										</label>
										<p class="pl-1">or drag and drop</p>
									</div>
									<p class="text-xs text-gray-500">PDF up to 10MB</p>
								</div>
							</div>
						</div>
					</div>

					{#if error}
						<div class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
							<div class="flex">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-3 h-5 w-5 flex-shrink-0 text-red-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<div>{error}</div>
							</div>
						</div>
					{/if}

					<button
						on:click={handleFileUpload}
						class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
						disabled={isLoading}
					>
						<span
							class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
						></span>
						{#if isLoading}
							<div class="flex items-center justify-center">
								<svg
									class="mr-2 h-5 w-5 animate-spin text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									></path>
								</svg>
								Analyzing...
							</div>
						{:else}
							Analyze Report
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Inference Section -->
		<div class="lg:col-span-2">
			{#if isLoading}
				<div
					class="flex h-56 flex-col items-center justify-center rounded-xl bg-white p-8 shadow-md"
				>
					<div class="relative mb-6 h-16 w-16">
						<div class="absolute h-16 w-16 animate-ping rounded-full bg-blue-400 opacity-20"></div>
						<div
							class="relative h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
						></div>
					</div>
					<p class="text-gray-600">Analyzing your report and preparing insights...</p>
				</div>
			{:else if generatedInference}
				<div class="overflow-hidden rounded-xl bg-white shadow-md">
					<div
						class="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4"
					>
						<h2 class="flex items-center text-lg font-semibold text-gray-800">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-2 h-5 w-5 text-emerald-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
							Analysis Results
						</h2>
					</div>

					<div class="p-6">
						<div class="prose max-w-none rounded-lg bg-white p-4 text-gray-700">
							{@html generatedInferenceHtml}
						</div>

						<!-- Disclaimer -->
						<div class="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
							<div class="flex">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-3 h-5 w-5 flex-shrink-0 text-amber-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<div>
									<p class="font-medium">Important Disclaimer:</p>
									<p class="mt-1">
										This analysis is provided for educational purposes only and is not a substitute
										for professional medical advice. Please consult with a healthcare professional
										for proper diagnosis and treatment.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="flex h-full flex-col items-center justify-center rounded-xl bg-white p-8 shadow-md"
				>
					<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-10 w-10 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<h3 class="text-lg font-medium text-gray-900">No Analysis Yet</h3>
					<p class="mt-2 text-center text-gray-600">
						Upload your medical report to get AI-powered analysis and insights.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.prose h1 {
		@apply mb-4 mt-6 text-xl font-bold text-gray-900;
	}
	.prose h2 {
		@apply mb-3 mt-5 text-lg font-semibold text-gray-900;
	}
	.prose h3 {
		@apply mb-2 mt-4 text-base font-medium text-gray-900;
	}
	.prose p {
		@apply my-3 text-gray-700;
	}
	.prose ul {
		@apply my-3 ml-6 list-disc;
	}
	.prose ol {
		@apply my-3 ml-6 list-decimal;
	}
	.prose li {
		@apply my-1;
	}
	.prose a {
		@apply text-blue-600 underline hover:text-blue-800;
	}
	.prose table {
		@apply my-4 w-full border-collapse overflow-hidden rounded;
	}
	.prose th,
	.prose td {
		@apply border border-gray-300 px-4 py-2 text-left;
	}
	.prose th {
		@apply bg-gray-100 font-medium;
	}
	.prose blockquote {
		@apply my-4 border-l-4 border-blue-300 bg-blue-50 p-3 pl-4 italic text-gray-700;
	}
	.prose code {
		@apply rounded bg-gray-100 px-1 py-0.5 font-mono text-sm;
	}
</style>
