<script>
	import { goto } from '$app/navigation';
	import Navbar from '../components/Navbar.svelte';
	import MedMasterLogo from '$lib/medmaster_logo.png';
	import RadiologyIcon from '$lib/Radiology.png';
	import ReportIcon from '$lib/report_3.png';
	import YogaIcon from '$lib/yoga.png';
	import ExerciseIcon from '$lib/gym.png';
	import TelemedicenIcon from '$lib/teli.png';
	import MBTIIcon from '$lib/mbti_2.png';
	import ChatRoomIcon from '$lib/chat_room.png';
	import BrainTumorIcon from '$lib/brain_3.png';

	// Feature data array with icons
	const features = [
		{
			title: 'MBTI Chatbot',
			description: 'MBTI-enabled personalized chatbot for mental health support',
			link: '/dashboard/mbti-chatbot',
			icon: `${MBTIIcon}`
		},
		{
			title: 'Report Inference',
			description: 'Drafts a first inference based on the report',
			link: '/dashboard/report-ineference',
			icon: `${ReportIcon}`
		},
		{
			title: 'Telemedicine',
			description: 'Remote consultations with advanced AI support',
			link: '/dashboard/general-health-support',
			icon: `${TelemedicenIcon}`
		},
		{
			title: 'Yoga',
			description: 'Yoga guide for beginners to attain good posture',
			link: '/dashboard/yoga',
			icon: `${YogaIcon}`
		},
		{
			title: 'Exercise',
			description: 'Helps rectify the form of the person during workouts',
			link: '/dashboard/exercise',
			icon: `${ExerciseIcon}`
		},
		// {
		// 	title: 'Brain Tumor Classification',
		// 	description: 'Detects and classifies brain tumors',
		// 	link: '/dashboard/classifier',
		// 	icon: `${BrainTumorIcon}`
		// },
		{
			title: 'Chat Room',
			description: 'Collaborate with professionals in a secure chat room',
			link: '/dashboard/chat',
			icon: `${ChatRoomIcon}`
		}
	];

	async function handleDashboardClick() {
		try {
			await goto('/dashboard', { replaceState: false });
			// Force a page reload if the navigation doesn't work properly
			if (window.location.pathname !== '/dashboard') {
				window.location.href = '/dashboard';
			}
		} catch (error) {
			console.error('Navigation error:', error);
			// Fallback to direct location change
			window.location.href = '/dashboard';
		}
	}
</script>

<main class="min-h-screen w-full bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
	<!-- Navbar -->
	<section id="navbar" class="bg-white shadow-md">
		<Navbar />
	</section>

	<!-- Hero Section -->
	<section class="relative overflow-hidden py-20 md:py-32">
		<div class="absolute inset-0 z-0 opacity-70">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1440 320"
				class="absolute bottom-0 left-0"
			>
				<path
					fill="#e0f2fe"
					fill-opacity="0.5"
					d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,208C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
				>
				</path>
			</svg>

			<div
				class="absolute -right-24 top-20 h-64 w-64 rounded-full bg-blue-200 opacity-50 blur-3xl"
			></div>
			<div
				class="absolute -left-20 top-40 h-72 w-72 rounded-full bg-teal-200 opacity-50 blur-3xl"
			></div>
			<div
				class="absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-purple-200 opacity-40 blur-3xl"
			></div>
		</div>

		<div class="relative z-10 mx-auto max-w-7xl px-6">
			<div class="flex flex-col items-center md:flex-row md:justify-between md:gap-12">
				<div class="mb-12 text-center md:mb-0 md:max-w-xl md:text-left">
					<h1 class="mb-6 text-4xl font-bold leading-tight text-blue-900 md:text-5xl lg:text-6xl">
						<span
							class="inline-block bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
							>MedMaster</span
						>
						<span class="mt-1 block">AI-Powered Healthcare</span>
					</h1>
					<p class="mb-8 text-lg text-gray-700 md:text-xl">
						Experience the future of healthcare with <span class="font-semibold"
							>personalized insights</span
						>,
						<span class="font-semibold">remote consultations</span>, and
						<span class="font-semibold">proactive health management</span>
						powered by our cutting-edge AI technology.
					</p>
					<button
						class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-teal-500 p-0.5 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						onclick={() => {
							window.location.href = '/dashboard';
						}}
					>
						<span
							class="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-3.5 transition-all duration-75"
						>
							<span>Get Started</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</button>
				</div>

				<div class="relative hidden md:block md:w-2/5">
					<div
						class="absolute -left-4 -top-4 h-full w-full rounded-2xl border-2 border-blue-200 bg-white/30 backdrop-blur-sm"
					></div>
					<div
						class="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border-2 border-teal-200 bg-white/30 backdrop-blur-sm"
					></div>
					<div
						class="relative z-10 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
					>
						<img
							src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=512&h=512&q=80"
							alt="Healthcare"
							class="h-full w-full rounded-xl object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="py-10">
		<div class="mx-auto max-w-7xl px-6">
			<div
				class="grid grid-cols-2 gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl md:grid-cols-4 md:gap-6 md:p-8"
			>
				<div class="flex flex-col items-center p-3 text-center">
					<span class="mb-1 text-3xl font-bold md:text-4xl">24/7</span>
					<span class="text-sm text-blue-100 md:text-base">Support Access</span>
				</div>
				<div class="flex flex-col items-center p-3 text-center">
					<span class="mb-1 text-3xl font-bold md:text-4xl">99%</span>
					<span class="text-sm text-blue-100 md:text-base">Diagnostic Accuracy</span>
				</div>
				<div class="flex flex-col items-center p-3 text-center">
					<span class="mb-1 text-3xl font-bold md:text-4xl">5+</span>
					<span class="text-sm text-blue-100 md:text-base">Health Services</span>
				</div>
				<div class="flex flex-col items-center p-3 text-center">
					<span class="mb-1 text-3xl font-bold md:text-4xl">5min</span>
					<span class="text-sm text-blue-100 md:text-base">Average Response</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-16 md:py-24">
		<div class="mx-auto max-w-7xl px-6">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
					Comprehensive <span class="text-teal-600">Healthcare Solutions</span>
				</h2>
				<p class="mx-auto max-w-2xl text-gray-600">
					Our platform integrates AI technology with medical expertise to provide you with
					personalized health services tailored to your unique needs.
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as feature, index}
					<div
						onclick={() => goto(feature.link)}
						class="group flex cursor-pointer flex-col rounded-xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
						style="animation-delay: {index * 100}ms"
					>
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-50 to-teal-50 p-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-teal-100"
						>
							<img src={feature.icon} alt={feature.title} class="h-10 w-10" />
						</div>
						<h3 class="mb-3 text-xl font-semibold text-gray-800">{feature.title}</h3>
						<p class="mb-4 text-gray-600">{feature.description}</p>
						<div
							class="mt-auto flex items-center text-sm font-medium text-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						>
							<span>Learn more</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="ml-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Testimonial Section -->
	<section class="bg-gray-50 py-16">
		<div class="mx-auto max-w-7xl px-6">
			<div class="mb-12 flex flex-col items-center text-center">
				<span
					class="mb-3 inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800"
					>Testimonials</span
				>
				<h2 class="mb-6 text-3xl font-bold text-gray-900">Trusted by Healthcare Professionals</h2>
			</div>

			<div class="mx-auto max-w-4xl">
				<div class="overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
					<div class="mb-6 flex items-center">
						<div class="mr-4 h-14 w-14 overflow-hidden rounded-full bg-blue-100">
							<img
								src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
								alt="Doctor"
								class="h-full w-full object-cover"
							/>
						</div>
						<div>
							<h3 class="text-lg font-medium text-gray-900">Dr. Sarah Johnson</h3>
							<p class="text-sm text-gray-600">Chief Medical Officer, Central Hospital</p>
						</div>
					</div>
					<p class="mb-4 text-lg italic text-gray-700">
						"MedMaster has revolutionized our approach to patient care. The AI-powered diagnostics
						and personalized health plans have significantly improved patient outcomes and
						satisfaction."
					</p>
					<div class="flex text-yellow-400">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							><path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/></svg
						>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							><path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/></svg
						>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							><path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/></svg
						>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							><path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/></svg
						>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							><path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/></svg
						>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer Section -->
	<footer class="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 text-white">
		<div class="mx-auto max-w-7xl px-6 py-12">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
				<!-- Brand -->
				<div>
					<h2 class="text-2xl font-bold">MedMaster</h2>
					<p class="mt-2 text-blue-200">Transforming healthcare through innovative AI solutions.</p>
					<div class="mt-4 flex space-x-4">
						<a href="#" class="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
								/>
							</svg>
						</a>
						<a href="#" class="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.056 1.805.249 2.227.418.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.358 1.057.413 2.227.058 1.265.07 1.645.07 4.849 0 3.205-.012 3.584-.07 4.849-.055 1.17-.249 1.805-.413 2.227-.216.562-.477.96-.896 1.381-.42.419-.82.679-1.382.896-.422.164-1.057.358-2.227.413-1.265.058-1.645.07-4.85.07-3.204 0-3.584-.012-4.849-.07-1.17-.055-1.805-.249-2.227-.413-.562-.217-.96-.477-1.381-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.358-1.057-.413-2.227-.058-1.265-.07-1.645-.07-4.849 0-3.204.012-3.584.07-4.85.055-1.17.249-1.805.413-2.227.217-.562.477-.96.896-1.381.42-.419.819-.679 1.381-.896.422-.164 1.057-.358 2.227-.413 1.265-.058 1.645-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.277.058-2.148.262-2.913.558-.789.306-1.459.717-2.126 1.385-.668.667-1.079 1.335-1.385 2.126-.296.765-.499 1.636-.558 2.913-.058 1.28-.072 1.688-.072 4.947 0 3.26.014 3.668.072 4.948.058 1.277.262 2.148.558 2.913.306.788.717 1.459 1.385 2.126.667.668 1.335 1.079 2.126 1.385.765.296 1.636.499 2.913.558 1.28.058 1.688.072 4.947.072 3.26 0 3.667-.014 4.947-.072 1.277-.058 2.148-.262 2.913-.558.788-.306 1.459-.717 2.126-1.385.668-.667 1.079-1.335 1.385-2.126.296-.765.499-1.636.558-2.913.058-1.28.072-1.688.072-4.947 0-3.259-.014-3.667-.072-4.947-.058-1.277-.262-2.148-.558-2.913-.306-.789-.717-1.459-1.385-2.126-.667-.668-1.335-1.079-2.126-1.385-.765-.296-.296-1.636-.499-2.913-.558-1.28-.058-1.688-.072-4.947-.072z"
								/>
								<path
									d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"
								/>
								<path d="M19.846 5.595a1.439 1.439 0 100-2.877 1.439 1.439 0 000 2.877z" />
							</svg>
						</a>
						<a href="#" class="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Quick Links -->
				<div>
					<h3 class="mb-4 font-semibold">Quick Links</h3>
					<ul class="space-y-2 text-blue-200">
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline">About Us</a>
						</li>
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline">Our Services</a
							>
						</li>
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline">Blog & News</a>
						</li>
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline">Contact Us</a>
						</li>
					</ul>
				</div>

				<!-- Legal -->
				<div>
					<h3 class="mb-4 font-semibold">Legal</h3>
					<ul class="space-y-2 text-blue-200">
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline"
								>Privacy Policy</a
							>
						</li>
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline"
								>Terms of Service</a
							>
						</li>
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline"
								>Cookie Settings</a
							>
						</li>
						<li>
							<a href="#" class="transition-colors hover:text-white hover:underline"
								>HIPAA Compliance</a
							>
						</li>
					</ul>
				</div>

				<!-- Stay Updated -->
				<div>
					<h3 class="mb-4 font-semibold">Stay Updated</h3>
					<p class="mb-4 text-blue-200">Get weekly insights and healthcare tips.</p>
					<div class="flex">
						<input
							type="email"
							placeholder="Your email"
							class="w-full rounded-l-md border-0 bg-white/10 px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
						/>
						<button
							class="rounded-r-md bg-teal-500 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-600"
						>
							Subscribe
						</button>
					</div>
				</div>
			</div>

			<!-- Footer Bottom -->
			<div class="mt-10 border-t border-blue-800 pt-8">
				<div
					class="flex flex-col items-center justify-between gap-4 text-sm text-blue-300 md:flex-row"
				>
					<p>© 2023 MedMaster. All Rights Reserved.</p>
					<div class="flex space-x-4">
						<a href="#" class="hover:text-white">Privacy</a>
						<a href="#" class="hover:text-white">Terms</a>
						<a href="#" class="hover:text-white">Accessibility</a>
					</div>
				</div>
			</div>
		</div>
	</footer>
</main>

<style>
	/* Add any additional styles here */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.group {
		animation: fadeInUp 0.6s ease-out forwards;
		opacity: 0;
	}
</style>
