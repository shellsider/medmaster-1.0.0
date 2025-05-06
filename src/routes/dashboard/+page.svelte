<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { writable } from 'svelte/store';
	import Highcharts from 'highcharts';

	const userData = writable({
		mbti: '',
		ei: { I: 0, E: 0 },
		sn: { N: 0, S: 0 },
		tf: { F: 0, T: 0 },
		jp: { P: 0, J: 0 }
	});

	// MBTI type descriptions
	const mbtiDescriptions = {
		ISTJ: 'Quiet, serious, earn success by thoroughness and dependability. Practical, matter-of-fact, realistic, and responsible.',
		ISFJ: 'Quiet, friendly, responsible, and conscientious. Committed and steady in meeting their obligations.',
		INFJ: "Seeks meaning and connection in ideas, relationships, and material possessions. Wants to understand people's motivations.",
		INTJ: 'Have original minds and great drive for implementing their ideas and achieving their goals.',
		ISTP: 'Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions.',
		ISFP: "Quiet, friendly, sensitive, and kind. Enjoy the present moment, what's going on around them.",
		INFP: 'Idealistic, loyal to their values and to people who are important to them. Curious and quick to see possibilities.',
		INTP: 'Seek to develop logical explanations for everything that interests them. Theoretical and abstract.',
		ESTP: 'Flexible and tolerant, they take a pragmatic approach focused on immediate results.',
		ESFP: 'Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts.',
		ENFP: 'Warmly enthusiastic and imaginative. See life as full of possibilities. Make connections between events and information quickly.',
		ENTP: 'Quick, ingenious, stimulating, alert, and outspoken. Resourceful in solving new and challenging problems.',
		ESTJ: 'Practical, realistic, matter-of-fact. Decisive, quickly move to implement decisions. Focus on getting results efficiently.',
		ESFJ: 'Warmhearted, conscientious, and cooperative. Want harmony in their environment, work with determination to establish it.',
		ENFJ: 'Warm, empathetic, responsive, and responsible. Highly attuned to the emotions, needs, and motivations of others.',
		ENTJ: 'Frank, decisive, assume leadership readily. Quickly see illogical and inefficient procedures and policies.'
	};

	// MBTI career suggestions
	const mbtiCareers = {
		ISTJ: ['Accountant', 'Engineer', 'Project Manager', 'Financial Analyst'],
		ISFJ: ['Nurse', 'Teacher', 'Social Worker', 'Healthcare Administrator'],
		INFJ: ['Counselor', 'HR Manager', 'Writer', 'Therapist'],
		INTJ: ['Scientist', 'Systems Analyst', 'Architect', 'Investment Banker'],
		ISTP: ['Mechanic', 'Software Developer', 'Pilot', 'Forensic Scientist'],
		ISFP: ['Artist', 'Designer', 'Veterinarian', 'Physical Therapist'],
		INFP: ['Writer', 'Psychologist', 'Graphic Designer', 'Social Worker'],
		INTP: ['Computer Programmer', 'Mathematician', 'Professor', 'Research Scientist'],
		ESTP: ['Entrepreneur', 'Marketer', 'Sales Representative', 'Emergency Medical Technician'],
		ESFP: ['Event Planner', 'Travel Agent', 'Entertainer', 'Customer Service Representative'],
		ENFP: ['Journalist', 'Consultant', 'Public Relations Specialist', 'Counselor'],
		ENTP: ['Lawyer', 'Entrepreneur', 'Creative Director', 'Systems Analyst'],
		ESTJ: ['Manager', 'Judge', 'Financial Officer', 'School Administrator'],
		ESFJ: ['Teacher', 'Sales Representative', 'Healthcare Worker', 'Office Manager'],
		ENFJ: ['Teacher', 'HR Manager', 'Public Relations', 'Sales Manager'],
		ENTJ: ['Executive', 'Lawyer', 'Management Consultant', 'Business Administrator']
	};

	// Health recommendations based on MBTI
	const mbtiHealthTips = {
		I: 'Make time for solitude to recharge, practice mindfulness, and set boundaries with social activities.',
		E: 'Schedule regular social activities, stay connected through communication, and find balance between interaction and rest.',
		S: 'Focus on practical, consistent health routines, track progress with concrete measures, and stick to proven health approaches.',
		N: 'Explore innovative health practices, find meaning in your wellness journey, and connect health goals to your values.',
		T: 'Research health decisions thoroughly, set logical fitness goals, and use data to track your progress.',
		F: 'Connect health choices to personal values, find supportive communities, and consider how your well-being affects others.',
		J: 'Create structured health schedules, set clear goals with deadlines, and maintain consistent routines.',
		P: 'Build flexibility into your health routines, try varied activities to stay engaged, and adapt your approach as needed.'
	};

	async function fetchUserData() {
		try {
			const res = await axios.get('/api/user');
			if (res.data?.user) {
				userData.set(res.data.user);
				renderCharts(res.data.user);
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	}

	function renderCharts(data) {
		const chartConfigs = [
			{
				id: 'ei-chart',
				title: 'Introvert (I) vs Extrovert (E)',
				data: [
					{ name: 'Introvert (I)', y: data.ei_I, color: '#3b82f6' },
					{ name: 'Extrovert (E)', y: data.ei_E, color: '#14b8a6' }
				]
			},
			{
				id: 'sn-chart',
				title: 'Intuitive (N) vs Sensing (S)',
				data: [
					{ name: 'Intuitive (N)', y: data.sn_N, color: '#8b5cf6' },
					{ name: 'Sensing (S)', y: data.sn_S, color: '#06b6d4' }
				]
			},
			{
				id: 'tf-chart',
				title: 'Thinking (T) vs Feeling (F)',
				data: [
					{ name: 'Thinking (T)', y: data.tf_T, color: '#f59e0b' },
					{ name: 'Feeling (F)', y: data.tf_F, color: '#f97316' }
				]
			},
			{
				id: 'jp-chart',
				title: 'Judging (J) vs Perceiving (P)',
				data: [
					{ name: 'Judging (J)', y: data.jp_J, color: '#10b981' },
					{ name: 'Perceiving (P)', y: data.jp_P, color: '#ef4444' }
				]
			}
		];

		chartConfigs.forEach((config) => {
			Highcharts.chart(config.id, {
				chart: {
					type: 'pie',
					backgroundColor: 'transparent',
					borderRadius: 8,
					spacing: [20, 20, 20, 20]
				},
				title: {
					text: config.title,
					style: { color: '#374151', fontSize: '16px', fontWeight: '600' }
				},
				tooltip: {
					pointFormat: '<b>{point.percentage:.1f}%</b>'
				},
				series: [
					{
						name: config.title,
						data: config.data,
						innerSize: '60%',
						size: '85%',
						borderWidth: 0,
						dataLabels: {
							enabled: false
						}
					}
				],
				plotOptions: {
					pie: {
						dataLabels: {
							enabled: false
						},
						showInLegend: true
					}
				},
				legend: {
					align: 'center',
					verticalAlign: 'bottom',
					layout: 'horizontal',
					itemStyle: { fontSize: '13px', fontWeight: 'normal', color: '#4b5563' },
					itemMarginTop: 5,
					itemMarginBottom: 5,
					symbolRadius: 0
				},
				credits: {
					enabled: false
				}
			});
		});
	}

	onMount(() => {
		fetchUserData();
	});

	function getTypeFromPreferences() {
		if (!$userData.mbti) {
			return '';
		}
		return $userData.mbti;
	}

	function getMbtiDescription() {
		const type = getTypeFromPreferences();
		return mbtiDescriptions[type] || 'Complete the MBTI test to see your personality description.';
	}

	function getMbtiCareers() {
		const type = getTypeFromPreferences();
		return mbtiCareers[type] || [];
	}

	function getPersonalizedHealthTips() {
		const type = getTypeFromPreferences();
		if (!type) return [];

		return type.split('').map((letter) => mbtiHealthTips[letter]);
	}
</script>

<!-- Dashboard Overview -->
<div class="space-y-6">
	<!-- Welcome Section -->
	<div
		class="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 p-6 text-white shadow-xl"
	>
		<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
			<h2 class="text-2xl font-bold tracking-tight">Welcome to Your Health Dashboard</h2>
			<div
				class="flex h-10 items-center rounded-full bg-white/20 px-4 font-medium backdrop-blur-sm"
			>
				Today is {new Date().toLocaleDateString('en-US', {
					weekday: 'long',
					month: 'long',
					day: 'numeric'
				})}
			</div>
		</div>
		<p class="max-w-3xl text-indigo-100">
			Your personalized AI healthcare companion. Explore your MBTI profile, get health
			recommendations tailored to your personality, and access our suite of health tools to improve
			your wellbeing.
		</p>
	</div>

	<!-- MBTI Profile Section with Recommendations -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- MBTI Type Card -->
		<div
			class="overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg"
		>
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Your MBTI Personality</h2>
				<span
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 bg-opacity-30"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
						/>
					</svg>
				</span>
			</div>
			<div class="mt-4 flex items-baseline space-x-2">
				<h3 class="text-3xl font-bold">{$userData.mbti || 'Take the Test!'}</h3>
				{#if !$userData.mbti}
					<span class="rounded-full bg-blue-500 bg-opacity-25 px-3 py-1 text-sm">
						Not Available
					</span>
				{/if}
			</div>
			<p class="mt-2 text-blue-100">
				{getMbtiDescription()}
			</p>
		</div>

		<!-- AI Health Insights -->
		<div class="overflow-hidden rounded-xl bg-white p-6 shadow-md">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-800">AI Health Insights</h2>
				<span class="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-violet-600"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"
						/>
					</svg>
				</span>
			</div>
			<div class="mt-4 space-y-3">
				{#if getPersonalizedHealthTips().length > 0}
					{#each getPersonalizedHealthTips().slice(0, 2) as tip}
						<div class="flex items-start rounded-lg border border-gray-100 bg-gray-50 p-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<p class="text-sm text-gray-600">{tip}</p>
						</div>
					{/each}
				{:else}
					<div class="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500">
						Complete your MBTI assessment to get personalized insights
					</div>
				{/if}
			</div>
		</div>

		<!-- Recommended Careers -->
		<div class="overflow-hidden rounded-xl bg-white p-6 shadow-md">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-800">Recommended Careers</h2>
				<span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-amber-600"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
							clip-rule="evenodd"
						/>
						<path
							d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"
						/>
					</svg>
				</span>
			</div>
			<div class="mt-4">
				{#if getMbtiCareers().length > 0}
					<div class="flex flex-wrap gap-2">
						{#each getMbtiCareers() as career}
							<span class="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
								{career}
							</span>
						{/each}
					</div>
				{:else}
					<div class="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500">
						Complete your MBTI assessment to see career recommendations
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- MBTI Charts -->
	<div class="rounded-xl bg-white p-6 shadow-md">
		<h2 class="mb-6 text-lg font-semibold text-gray-800">MBTI Personality Analysis</h2>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
			<div id="ei-chart" class="h-64 rounded-lg md:h-72"></div>
			<div id="sn-chart" class="h-64 rounded-lg md:h-72"></div>
			<div id="tf-chart" class="h-64 rounded-lg md:h-72"></div>
			<div id="jp-chart" class="h-64 rounded-lg md:h-72"></div>
		</div>
	</div>

	<!-- Quick Access Tools -->
	<div class="rounded-xl bg-white p-6 shadow-md">
		<h2 class="mb-4 text-lg font-semibold text-gray-800">Health Tools</h2>

		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			<a
				href="/dashboard/general-health-support"
				class="group flex flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-blue-50"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200"
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
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-gray-700 group-hover:text-blue-700"
					>Health Support</span
				>
			</a>

			<a
				href="/dashboard/report-ineference"
				class="group flex flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-green-50"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors group-hover:bg-green-200"
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
				</div>
				<span class="text-sm font-medium text-gray-700 group-hover:text-green-700">Reports</span>
			</a>

			<a
				href="/dashboard/mbti-chatbot"
				class="group flex flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-purple-50"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-200"
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
				</div>
				<span class="text-sm font-medium text-gray-700 group-hover:text-purple-700"
					>MBTI Chatbot</span
				>
			</a>

			<a
				href="/dashboard/exercise"
				class="group flex flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-red-50"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-200"
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
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-gray-700 group-hover:text-red-700">Exercise</span>
			</a>

			<a
				href="/dashboard/yoga"
				class="group flex flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-teal-50"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 transition-colors group-hover:bg-teal-200"
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
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-gray-700 group-hover:text-teal-700">Yoga</span>
			</a>

			<a
				href="/dashboard/chat"
				class="group flex flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-amber-50"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200"
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
							d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-gray-700 group-hover:text-amber-700"
					>Medical Chat</span
				>
			</a>
		</div>
	</div>
</div>
