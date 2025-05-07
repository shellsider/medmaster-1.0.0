<script>
	import axios from 'axios';
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	let symptoms = '';
	let language = 'en'; // Default is English, "hi" for Hindi
	let recommendation = '';
	let recommendationHtml = '';
	let audioSrc = '';
	let isLoading = false;
	let error = '';
	let isPlaying = false; // Tracks if the audio is playing
	let audioElement = null; // Reference to the audio element
	let recentSymptoms = [
		'Cough and cold',
		'Fever and body ache',
		'Headache and migraine',
		'Stomach pain and digestion'
	];

	// Convert the recommendation text (Markdown) to HTML.
	$: {
		let cleanText = recommendation.replace(/^'+|'+$/g, '');
		if (language === 'hi') {
			cleanText = cleanText.replace(/[–—]/g, '-');
		}
		recommendationHtml = marked(cleanText, { breaks: true });
	}

	async function getRecommendation() {
		if (!symptoms) {
			error = 'Please enter your symptoms.';
			return;
		}
		error = '';
		recommendation = '';
		audioSrc = '';
		isLoading = true;

		const formData = new FormData();
		formData.append('symptoms', symptoms);
		formData.append('language', language);

		try {
			const response = await axios.post('/api/genral-health-support', formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			recommendation = response.data.recommendation;
			audioSrc = 'data:audio/mp3;base64,' + response.data.audio;

			// Add to recent symptoms if not already there
			if (!recentSymptoms.includes(symptoms)) {
				recentSymptoms = [symptoms, ...recentSymptoms.slice(0, 3)];
			}
		} catch (err) {
			console.error(err);
			error = 'An error occurred while getting the recommendation.';
		} finally {
			isLoading = false;
		}
	}

	function toggleAudio() {
		if (!audioElement) {
			audioElement = new Audio(audioSrc);
			audioElement.addEventListener('ended', () => {
				isPlaying = false; // Reset state when the audio ends
			});
		}

		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
		isPlaying = !isPlaying;
	}

	function selectRecentSymptom(symptom) {
		symptoms = symptom;
	}

	function selectCategory(category) {
		if (symptoms) {
			symptoms += ', ' + category.name.toLowerCase();
		} else {
			symptoms = category.name.toLowerCase();
		}
		document.getElementById('symptoms')?.focus();
	}

	onMount(() => {
		// Focus on the input field when the component mounts
		document.getElementById('symptoms')?.focus();
	});
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
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-6 w-6"
					>
						<path
							d="M8 9h8m-8 3h5m-9 3h14a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2zM6 18v2m4-2v2m4-2v2"
						></path>
					</svg>
				</span>
				<div>
					<h1 class="text-2xl font-bold">AI Health Consultant</h1>
					<p class="text-blue-100">Get personalized health recommendations in your language</p>
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
		<!-- Input Section -->
		<div class="space-y-6 lg:col-span-1">
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
								d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						{language === 'en' ? 'Describe Your Symptoms' : 'अपने लक्षणों का वर्णन करें'}
					</h2>
				</div>

				<div class="p-6">
					<form on:submit|preventDefault={getRecommendation}>
						<div class="mb-4">
							<label for="symptoms" class="mb-2 block text-sm font-medium text-gray-700">
								{language === 'en'
									? 'What symptoms are you experiencing?'
									: 'आप किन लक्षणों का अनुभव कर रहे हैं?'}
							</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-blue-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								<input
									id="symptoms"
									type="text"
									bind:value={symptoms}
									placeholder={language === 'en'
										? 'e.g., fever, cough, headache'
										: 'जैसे, बुखार, खांसी, सिरदर्द'}
									class="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
								/>
							</div>
							{#if error}
								<p class="mt-2 text-sm text-rose-600">{error}</p>
							{/if}
						</div>

						<button
							type="submit"
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
									{language === 'en' ? 'Getting Recommendations...' : 'सिफारिशें प्राप्त करना...'}
								</div>
							{:else}
								{language === 'en' ? 'Get Recommendations' : 'सिफारिशें प्राप्त करें'}
							{/if}
						</button>
					</form>
				</div>
			</div>

			<!-- Recent Symptoms -->
			<div class="overflow-hidden rounded-xl bg-white shadow-md">
				<div
					class="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4"
				>
					<h2 class="flex items-center text-lg font-semibold text-gray-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5 text-indigo-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						{language === 'en' ? 'Common Symptoms' : 'सामान्य लक्षण'}
					</h2>
				</div>

				<div class="p-6">
					<p class="mb-4 text-sm text-gray-600">
						{language === 'en'
							? 'Click on any common symptom to get started'
							: 'शुरू करने के लिए किसी भी सामान्य लक्षण पर क्लिक करें'}
					</p>
					<div class="space-y-2">
						{#each recentSymptoms as symptom}
							<button
								type="button"
								on:click={() => selectRecentSymptom(symptom)}
								class="flex w-full items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-2 h-4 w-4 text-indigo-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
									/>
								</svg>
								{symptom}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Recommendation Section -->
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
					<p class="text-gray-600">
						{language === 'en'
							? 'Analyzing your symptoms and preparing recommendations...'
							: 'आपके लक्षणों का विश्लेषण और सिफारिशें तैयार कर रहे हैं...'}
					</p>
					<p class="mt-2 text-sm text-gray-500">
						<!-- {language === 'en'
							? 'This usually takes 15-20 seconds'
							: 'इसमें आमतौर पर 15-20 सेकंड लगते हैं'} -->
					</p>
				</div>
			{:else if recommendation}
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
							{language === 'en' ? 'Medical Recommendations' : 'चिकित्सा अनुशंसाएँ'}
						</h2>
					</div>

					<div class="p-6">
						<div class="prose max-w-none rounded-lg bg-white p-4 text-gray-700">
							{@html recommendationHtml}
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
									<p class="font-medium">
										{language === 'en' ? 'Important Disclaimer:' : 'महत्वपूर्ण अस्वीकरण:'}
									</p>
									<p class="mt-1">
										{language === 'en'
											? 'This information is provided for educational purposes only and is not a substitute for professional medical advice. Please consult with a healthcare professional before taking any medication.'
											: 'यह जानकारी केवल शैक्षिक उद्देश्यों के लिए प्रदान की गई है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है। कृपया कोई भी दवा लेने से पहले स्वास्थ्य देखभाल पेशेवर से परामर्श करें।'}
									</p>
								</div>
							</div>
						</div>

						<!-- Audio Section -->
						{#if audioSrc}
							<div class="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
								<div class="text-center">
									<p class="mb-3 text-sm font-medium text-gray-700">
										{language === 'en'
											? 'Listen to recommendation in your language'
											: 'अपनी भाषा में अनुशंसा सुनें'}
									</p>
									<button
										on:click={toggleAudio}
										class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									>
										{#if isPlaying}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-8 w-8"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-8 w-8"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										{/if}
									</button>
									<div class="mt-3 text-center">
										<p class="text-sm font-medium text-gray-700">
											{isPlaying
												? language === 'en'
													? 'Playing...'
													: 'बज रहा है...'
												: language === 'en'
													? 'Tap to play'
													: 'बजाने के लिए टैप करें'}
										</p>
										<p class="mt-1 text-xs text-gray-500">
											{language === 'en'
												? 'Make sure your volume is turned up'
												: 'सुनिश्चित करें कि आपका वॉल्यूम चालू है'}
										</p>
									</div>
								</div>
							</div>
						{/if}
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
								d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
							/>
						</svg>
					</div>
					<h3 class="text-lg font-medium text-gray-900">
						{language === 'en' ? 'No Recommendations Yet' : 'अभी तक कोई अनुशंसा नहीं'}
					</h3>
					<p class="mt-2 text-center text-gray-600">
						{language === 'en'
							? 'Enter your symptoms to get personalized health recommendations.'
							: 'व्यक्तिगत स्वास्थ्य सिफारिशें प्राप्त करने के लिए अपने लक्षण दर्ज करें।'}
					</p>

					<!-- Example symptoms for first-time users -->
					<div class="mt-6 w-full max-w-md">
						<p class="mb-2 text-center text-sm font-medium text-gray-700">
							{language === 'en' ? 'Try these common symptoms:' : 'इन सामान्य लक्षणों को आज़माएं:'}
						</p>
						<div class="flex flex-wrap justify-center gap-2">
							<button
								on:click={() => selectRecentSymptom('Fever and headache')}
								class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
							>
								{language === 'en' ? 'Fever and headache' : 'बुखार और सिरदर्द'}
							</button>
							<button
								on:click={() => selectRecentSymptom('Cough and cold')}
								class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
							>
								{language === 'en' ? 'Cough and cold' : 'खांसी और जुकाम'}
							</button>
							<button
								on:click={() => selectRecentSymptom('Upset stomach')}
								class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
							>
								{language === 'en' ? 'Upset stomach' : 'पेट खराब'}
							</button>
						</div>
					</div>
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
