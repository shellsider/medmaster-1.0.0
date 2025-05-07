<!-- src/routes/dashboard/mbti-chatbot/+page.svelte -->
<script>
	import { onMount } from 'svelte';

	let showQuestions = false;
	let loading = false;
	let showChatbot = false;
	let summaryPrompt = '';
	let computedMbti = '';
	let language = 'en';

	// Your Botpress/chatbot iframe URL remains the same.
	let chatbotUrl =
		'https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/01/21/08/20250121085924-R8Q809X4.json';

	// 12 MBTI questions
	const questions = [
		// EI dimension questions
		{
			key: 'q1',
			dimension: 'EI',
			label: 'I gain energy from being around people and often seek out social gatherings.'
		},
		{
			key: 'q2',
			dimension: 'EI',
			label:
				'I prefer talking through ideas with others rather than thinking them through quietly on my own.'
		},
		{
			key: 'q3',
			dimension: 'EI',
			label:
				'I frequently initiate conversations and feel comfortable being the center of attention.'
		},
		// SN dimension questions
		{
			key: 'q4',
			dimension: 'SN',
			label: 'I focus on concrete details and trust what can be directly observed.'
		},
		{
			key: 'q5',
			dimension: 'SN',
			label:
				'When solving problems, ISm more interested in realistic applications than in hypothetical possibilities.'
		},
		{
			key: 'q6',
			dimension: 'SN',
			label:
				'I pay close attention to specifics (details, facts, data) rather than overarching patterns.'
		},
		// TF dimension questions
		{
			key: 'q7',
			dimension: 'TF',
			label:
				'When making decisions, I rely more on objective criteria than on personal values or others feelings.'
		},
		{
			key: 'q8',
			dimension: 'TF',
			label:
				'I find it relatively easy to give impartial feedback, even if it might hurt someones feelings.'
		},
		{
			key: 'q9',
			dimension: 'TF',
			label:
				'In conflicts, I prefer to resolve matters by calmly applying reason rather than focusing on emotions.'
		},
		// JP dimension questions
		{
			key: 'q10',
			dimension: 'JP',
			label: 'I like having a detailed plan or schedule and feel uneasy without one.'
		},
		{
			key: 'q11',
			dimension: 'JP',
			label:
				'I often complete tasks well before their deadlines rather than waiting until the last moment.'
		},
		{
			key: 'q12',
			dimension: 'JP',
			label: 'I prefer clear guidelines and defined roles over flexible or changing circumstances.'
		}
	];

	// Initialize answers (default slider value = 5 for each)
	let answers = {};
	for (let q of questions) {
		answers[q.key] = 5;
	}

	// Show questions section
	function startQuestions() {
		showQuestions = true;
	}

	// Returns a gradient background style for a slider
	function getSliderBackground(value) {
		const min = 1,
			max = 10;
		const percent = ((value - min) / (max - min)) * 100;
		return `background: linear-gradient(to right, #00C383 0%, #00C383 ${percent}%, #f0f0f0 ${percent}%, #f0f0f0 100%)`;
	}

	// Compute MBTI and percentages for each dimension.
	function computeMbtiAndPercentages() {
		let sumEI = 0,
			sumSN = 0,
			sumTF = 0,
			sumJP = 0;
		for (let q of questions) {
			const val = answers[q.key];
			switch (q.dimension) {
				case 'EI':
					sumEI += val;
					break;
				case 'SN':
					sumSN += val;
					break;
				case 'TF':
					sumTF += val;
					break;
				case 'JP':
					sumJP += val;
					break;
			}
		}

		// Each dimension has 3 questions, so the possible sum is 3 to 30.
		// Normalize each sum to a value in [0, 1]
		const normEI = (sumEI - 3) / 27;
		const normSN = (sumSN - 3) / 27;
		const normTF = (sumTF - 3) / 27;
		const normJP = (sumJP - 3) / 27;

		let letterEI, ei_I, ei_E;
		if (normEI >= 0.5) {
			letterEI = 'E';
			ei_E = Math.round(normEI * 100);
			ei_I = 100 - ei_E;
		} else {
			letterEI = 'I';
			ei_I = Math.round((1 - normEI) * 100);
			ei_E = 100 - ei_I;
		}

		let letterSN, sn_S, sn_N;
		if (normSN >= 0.5) {
			letterSN = 'S';
			sn_S = Math.round(normSN * 100);
			sn_N = 100 - sn_S;
		} else {
			letterSN = 'N';
			sn_N = Math.round((1 - normSN) * 100);
			sn_S = 100 - sn_N;
		}

		let letterTF, tf_T, tf_F;
		if (normTF >= 0.5) {
			letterTF = 'T';
			tf_T = Math.round(normTF * 100);
			tf_F = 100 - tf_T;
		} else {
			letterTF = 'F';
			tf_F = Math.round((1 - normTF) * 100);
			tf_T = 100 - tf_F;
		}

		let letterJP, jp_J, jp_P;
		if (normJP >= 0.5) {
			letterJP = 'J';
			jp_J = Math.round(normJP * 100);
			jp_P = 100 - jp_J;
		} else {
			letterJP = 'P';
			jp_P = Math.round((1 - normJP) * 100);
			jp_J = 100 - jp_P;
		}

		computedMbti = letterEI + letterSN + letterTF + letterJP;

		return {
			mbti: computedMbti,
			ei: { I: ei_I, E: ei_E },
			sn: { N: sn_N, S: sn_S },
			tf: { F: tf_F, T: tf_T },
			jp: { P: jp_P, J: jp_J }
		};
	}

	// Submit handler: compute MBTI, update database, then show chatbot.
	async function handleSubmit() {
		loading = true;

		// Compute MBTI and percentages
		const result = computeMbtiAndPercentages();

		// Build a summary prompt for copying, if needed
		let lines = [];
		lines.push(`Computed MBTI: ${result.mbti}`);
		questions.forEach((q) => {
			lines.push(`${q.label} => ${answers[q.key]}`);
		});
		summaryPrompt = `User's MBTI: ${result.mbti}. Adjust chatbot experience accordingly.`;

		// Update the user's MBTI data in the database.
		try {
			await fetch('/api/mbti/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(result)
			});
		} catch (err) {
			console.error('Failed to update MBTI in database', err);
		}

		// Simulate a brief loading time, then show the chatbot
		setTimeout(() => {
			loading = false;
			showChatbot = true;
		}, 1500);
	}

	// Copy prompt to clipboard
	async function copyPrompt() {
		try {
			await navigator.clipboard.writeText(summaryPrompt);
			alert('Prompt copied to clipboard!');
		} catch (error) {
			alert('Failed to copy prompt.');
			console.error(error);
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<!-- Header Section -->
	<div
		class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-6 text-white shadow-lg sm:px-6 lg:px-8"
	>
		<div class="mx-auto max-w-7xl">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
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
								d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							/>
						</svg>
					</span>
					<div>
						<h1 class="text-2xl font-bold">MBTI Personality Assessment</h1>
						<p class="text-blue-100">
							Discover your personality type and get personalized insights
						</p>
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
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- STEP 0: Intro Section -->
		{#if !showQuestions}
			<div class="mx-auto max-w-3xl">
				<div class="overflow-hidden rounded-xl bg-white shadow-md">
					<div
						class="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4"
					>
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
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Welcome to Your MBTI Journey
						</h2>
					</div>

					<div class="p-6">
						<div class="prose max-w-none text-gray-600">
							<p class="mb-4">
								This assessment will help you discover your MBTI personality type through a series
								of carefully crafted questions. Your responses will be used to:
							</p>
							<ul class="mb-6 space-y-2">
								<li class="flex items-center">
									<svg
										class="mr-2 h-5 w-5 text-blue-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Determine your preferences across four key dimensions
								</li>
								<li class="flex items-center">
									<svg
										class="mr-2 h-5 w-5 text-blue-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Provide insights into your natural tendencies
								</li>
								<li class="flex items-center">
									<svg
										class="mr-2 h-5 w-5 text-blue-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Enable personalized chatbot interactions
								</li>
							</ul>
							<p class="mb-6">
								The assessment consists of 12 questions, each rated on a scale from 1 (strongly
								disagree) to 10 (strongly agree). Take your time to answer honestly for the most
								accurate results.
							</p>
						</div>

						<button
							on:click={startQuestions}
							class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							<span
								class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
							></span>
							Start Assessment
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- STEP 1: Questions Section -->
		{#if showQuestions && !showChatbot}
			<div class="mx-auto max-w-3xl">
				<div class="overflow-hidden rounded-xl bg-white shadow-md">
					<div
						class="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4"
					>
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
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							Personality Assessment Questions
						</h2>
					</div>

					<div class="p-6">
						<form on:submit|preventDefault={handleSubmit} class="space-y-8">
							{#each questions as question, i}
								<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
									<div class="mb-4 flex items-start justify-between">
										<label class="text-base font-medium text-gray-900" for={question.key}>
											<span
												class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600"
											>
												{i + 1}
											</span>
											{question.label}
										</label>
										<span
											class="ml-4 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
										>
											{question.dimension}
										</span>
									</div>

									<div class="mt-4">
										<input
											type="range"
											id={question.key}
											bind:value={answers[question.key]}
											min="1"
											max="10"
											class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
											style={getSliderBackground(answers[question.key])}
										/>
										<div class="mt-2 flex justify-between text-sm text-gray-600">
											<span>Strongly Disagree</span>
											<span>Strongly Agree</span>
										</div>
										<div class="mt-2 text-center text-sm font-medium text-blue-600">
											{answers[question.key]}/10
										</div>
									</div>
								</div>
							{/each}

							<div class="flex justify-end">
								<button
									type="submit"
									class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
									disabled={loading}
								>
									<span
										class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
									></span>
									{#if loading}
										<div class="flex items-center">
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
											Processing...
										</div>
									{:else}
										Submit Assessment
									{/if}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		{/if}

		<!-- STEP 2: Chatbot Section -->
		{#if showChatbot}
			<div class="mx-auto max-w-4xl">
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
									d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
								/>
							</svg>
							Your Personalized MBTI Chatbot
						</h2>
					</div>

					<div class="p-6">
						<div class="mb-6 rounded-lg bg-blue-50 p-4">
							<div class="flex items-start">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-3 h-5 w-5 flex-shrink-0 text-blue-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<p class="font-medium text-blue-900">Your MBTI Type: {computedMbti}</p>
									<p class="mt-1 text-sm text-blue-700">
										The chatbot has been personalized based on your MBTI type. You can now interact
										with it to get insights and recommendations tailored to your personality.
									</p>
								</div>
							</div>
						</div>

						<div class="h-[600px] w-full overflow-hidden rounded-lg border border-gray-200">
							<iframe
								src={chatbotUrl}
								class="h-full w-full"
								title="MBTI Chatbot"
								allow="microphone; camera"
							></iframe>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom slider styling */
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		height: 8px;
		border-radius: 4px;
		background: #e5e7eb;
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #3b82f6;
		transition: all 0.2s ease;
	}

	input[type='range']::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #3b82f6;
		transition: all 0.2s ease;
		border: none;
	}

	input[type='range']::-moz-range-thumb:hover {
		transform: scale(1.1);
	}
</style>
