<!-- +page.svelte -->
<script>
	import { onMount } from 'svelte';
	import posePkg from '@mediapipe/pose';
	import drawingUtilsPkg from '@mediapipe/drawing_utils';
	import cameraUtilsPkg from '@mediapipe/camera_utils';
	const GIMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
	import TPose from '../../../lib/tpose.png';
	import WarriorPose from '../../../lib/warriorpose.png';
	import TreePose from '../../../lib/treepose.png';

	// Example: If you must import "google.generativeai" in the browser
	// (In practice, you'd often place this in a server route or use a different library)
	import { GoogleGenerativeAI } from '@google/generative-ai';
	let genAI;
	let responseText = '';

	// You will need to handle environment variables carefully in the client.
	const GEMINI_API_KEY = GIMINI_API_KEY; // <--- Replace with your real key or server-based approach

	// Configure Generative AI
	genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

	// Destructure MediaPipe Pose packages
	const { Pose, POSE_CONNECTIONS } = posePkg;
	const { drawConnectors, drawLandmarks } = drawingUtilsPkg;
	const { Camera } = cameraUtilsPkg;

	// -------------------------------------
	// Svelte State Variables
	// -------------------------------------
	let userProblem = '';
	let advice = '';
	let inputType = 'Live Feed'; // "Live Feed" or "Upload Image"
	let suggestedPose = ''; // e.g. "Warrior II Pose", "Tree Pose", or "T Pose"
	let referenceImage = null; // Points to matched image if found
	let images = {
		'Warrior II Pose': 'warriorpose.png',
		'Tree Pose': 'treepose.png',
		'T Pose': 'tpose.png'
	};

	// New state variable to hold the current detected pose (real-time)
	let currentDetectedPose = 'Unknown Pose';
	let poseAccuracy = 0; // Add pose accuracy tracking
	let targetPose = ''; // Add target pose tracking

	// Variables for the uploaded photo detection result
	let uploadedPhotoResult = '';
	let uploadedPhotoURL = '';

	let started = false;
	let stopped = false;

	// For MediaPipe & webcam usage
	let videoElement;
	let canvasElement;
	let canvasCtx;
	let imageFileUrl = '';
	let poseConfidence = 0;

	let camera = null;
	let pose = null;

	// For file upload
	let uploadedFile = null;
	// let videoFileUrl = null; // Not used in this example

	let isLoading = false; // Add loading state
	let suggestionsSection; // Add ref for scrolling

	// -------------------------------------
	// Generate Pose Advice using Gemini API
	// -------------------------------------
	async function getPostureAdvice(issue) {
		try {
			// Example prompt
			const prompt = `Suggest a yoga pose from three yoga poses only: Warrior II Pose, Tree Pose, or T Pose 
                        based on this issue: ${issue}. 
                        Provide some info based on user_input not more than 2 lines 
                        also provide 4 step instruction to perform this.
                        without any astrix, and without any special characters 
                        `;

			// Using gemini-pro model (example)
			const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

			const response = await model.generateContent(prompt);
			console.log('response', response?.response?.candidates[0]?.content?.parts[0]?.text);

			if (response && response.response) {
				return response?.response?.candidates[0]?.content?.parts[0]?.text;
			} else {
				return 'Could not generate a response. Try again.';
			}
		} catch (error) {
			console.error('Gemini API Error:', error);
			return 'Error calling Gemini API.';
		}
	}

	// -------------------------------------
	// Button: "Get Yoga Pose Suggestion"
	// -------------------------------------
	async function handleGetSuggestion() {
		isLoading = true;
		try {
			advice = await getPostureAdvice(userProblem);

			// Attempt to detect which pose was suggested
			for (const poseName of Object.keys(images)) {
				if (advice.includes(poseName)) {
					suggestedPose = poseName;
					targetPose = poseName; // Set the target pose
					if (suggestedPose === 'Tree Pose') {
						referenceImage = TreePose;
					} else if (suggestedPose === 'Warrior II Pose') {
						referenceImage = WarriorPose;
					} else if (suggestedPose === 'T Pose' || suggestedPose === 'T pose') {
						referenceImage = TPose;
					}
					break;
				}
			}

			// Wait for the DOM to update with the new content
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Scroll to suggestions section
			if (suggestionsSection) {
				suggestionsSection.scrollIntoView({ behavior: 'smooth' });
			}
		} catch (error) {
			console.error('Error getting pose suggestion:', error);
		} finally {
			isLoading = false;
		}
	}

	// ---------------------
	// Pose Classification
	// ---------------------
	function calculateAngle(a, b, c) {
		const ba = [a.x - b.x, a.y - b.y];
		const bc = [c.x - b.x, c.y - b.y];
		const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
		const magBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1]);
		const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
		const cosAngle = dotProduct / (magBA * magBC);
		const angle = Math.acos(Math.min(Math.max(cosAngle, -1.0), 1.0)) * (180 / Math.PI);
		return angle;
	}

	// Updated classification logic
	function classifyPose(landmarks) {
		let label = 'Unknown Pose';

		const leftElbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
		const rightElbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
		const leftShoulderAngle = calculateAngle(landmarks[13], landmarks[11], landmarks[23]);
		const rightShoulderAngle = calculateAngle(landmarks[24], landmarks[12], landmarks[14]);
		const leftKneeAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
		const rightKneeAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);

		// If arms are straight:
		if (leftElbowAngle > 165 && rightElbowAngle > 165) {
			// T Pose: both knees nearly fully extended (≥165°)
			if (leftKneeAngle >= 165 && rightKneeAngle >= 165) {
				label = 'T Pose';
			}
			// Warrior II Pose: one knee clearly bent (between 60° and 120°)
			else if (
				(leftKneeAngle < 120 && leftKneeAngle > 60) ||
				(rightKneeAngle < 120 && rightKneeAngle > 60)
			) {
				label = 'Warrior II Pose';
			}
		}
		// Tree Pose: One leg is extended and the other is bent significantly
		if (
			(leftKneeAngle < 90 && rightKneeAngle >= 165) ||
			(rightKneeAngle < 90 && leftKneeAngle >= 165)
		) {
			label = 'Tree Pose';
		}

		return label;
	}

	// Helper to get the reference image for a given pose name
	function getImageForPose(poseName) {
		if (poseName === 'Tree Pose') return TreePose;
		if (poseName === 'Warrior II Pose') return WarriorPose;
		if (poseName === 'T Pose') return TPose;
		return null;
	}

	// --------------------------------
	// Process single image (Upload)
	// --------------------------------
	function handleFileSelect(event) {
		const files = event.target.files;
		if (!files || !files.length) return;
		uploadedFile = files[0];
		// Store a URL for display in the UI
		uploadedPhotoURL = URL.createObjectURL(uploadedFile);

		const reader = new FileReader();
		reader.onload = () => {
			const arrayBuffer = reader.result;
			processUploadedImage(arrayBuffer);
		};
		reader.readAsArrayBuffer(uploadedFile);
	}

	async function processUploadedImage(arrayBuffer) {
		// Convert array buffer to image data
		const bytes = new Uint8Array(arrayBuffer);
		let img = new Image();
		const blob = new Blob([bytes], { type: uploadedFile.type });
		const url = uploadedPhotoURL;

		img.onload = async () => {
			// Draw to an offscreen canvas for Pose detection
			const offCanvas = document.createElement('canvas');
			offCanvas.width = img.width;
			offCanvas.height = img.height;
			const offCtx = offCanvas.getContext('2d');
			offCtx.drawImage(img, 0, 0);

			// Use Pose in static_image_mode
			if (!pose) {
				pose = new Pose({
					locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
				});
				pose.setOptions({
					staticImageMode: true,
					minDetectionConfidence: 0.5,
					minTrackingConfidence: 0.5
				});
				pose.onResults(onResults);
			}

			await pose.send({ image: offCanvas });
		};
		img.src = url;
	}

	// -------------------------
	// Live Pose Detection
	// -------------------------
	function startLiveDetection() {
		started = true;
		stopped = false;
		if (!pose) {
			pose = new Pose({
				locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
			});
			pose.setOptions({
				modelComplexity: 1,
				smoothLandmarks: true,
				enableSegmentation: false,
				smoothSegmentation: true,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5
			});
			pose.onResults(onResults);
		}

		if (!camera) {
			camera = new Camera(videoElement, {
				onFrame: async () => {
					await pose.send({ image: videoElement });
				},
				width: 640,
				height: 480
			});
		}
		camera.start();
	}

	function onResults(results) {
		if (!results.poseLandmarks) {
			return;
		}
		// Draw to canvas
		canvasCtx.save();
		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

		drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
			color: '#00FF00',
			lineWidth: 4
		});
		drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

		// Calculate confidence score
		let totalConfidence = 0;
		let validLandmarks = 0;
		results.poseLandmarks.forEach((landmark) => {
			if (landmark.visibility > 0) {
				totalConfidence += landmark.visibility;
				validLandmarks++;
			}
		});
		poseConfidence = validLandmarks > 0 ? Math.round((totalConfidence / validLandmarks) * 100) : 0;

		// Classify and update the real-time detected pose variable
		const detectedPose = classifyPose(results.poseLandmarks);
		currentDetectedPose = detectedPose;

		// Calculate pose accuracy
		poseAccuracy = calculatePoseAccuracy(detectedPose, targetPose);

		canvasCtx.restore();
	}

	function stopLiveDetection() {
		started = false;
		stopped = true;
		if (camera) {
			camera.stop();
		}
	}

	// Add function to calculate pose accuracy
	function calculatePoseAccuracy(detectedPose, targetPose) {
		if (!targetPose || detectedPose === 'Unknown Pose') return 0;
		return detectedPose === targetPose ? 100 : 0;
	}

	// ---------------
	// onMount Setup
	// ---------------
	onMount(() => {
		// Prepare canvas context
		canvasCtx = canvasElement.getContext('2d');
	});
</script>

<!-- Tailwind container for styling -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<!-- Header Section -->
	<div
		class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 px-4 py-6 text-white shadow-lg sm:px-6 lg:px-8"
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
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							/>
						</svg>
					</span>
					<div>
						<h1 class="text-2xl font-bold">AI Yoga Assistant</h1>
						<p class="text-green-100">
							Get personalized yoga pose suggestions and real-time pose detection
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Input Section -->
			<div class="overflow-hidden rounded-xl bg-white shadow-md">
				<div
					class="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4"
				>
					<h2 class="flex items-center text-lg font-semibold text-gray-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5 text-green-600"
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
						Describe Your Needs
					</h2>
				</div>

				<div class="p-6">
					<div class="mb-6">
						<label class="mb-2 block text-sm font-medium text-gray-700"
							>What would you like to work on?</label
						>
						<textarea
							class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							rows="4"
							placeholder="e.g., I want to improve my flexibility and reduce back pain..."
							bind:value={userProblem}
						></textarea>
					</div>

					<div class="space-y-4">
						<button
							class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
							on:click={handleGetSuggestion}
							disabled={isLoading}
						>
							<span
								class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
							></span>
							{#if isLoading}
								<div class="flex items-center justify-center">
									<svg
										class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Getting Suggestions...
								</div>
							{:else}
								Get Pose Suggestions
							{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- Pose Detection Section -->
			<div class="overflow-hidden rounded-xl bg-white shadow-md">
				<div
					class="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4"
				>
					<h2 class="flex items-center text-lg font-semibold text-gray-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						Pose Detection
					</h2>
				</div>

				<div class="p-6">
					<div class="mb-6">
						<div class="flex items-center justify-between">
							<label class="text-sm font-medium text-gray-700">Input Source</label>
							<div class="flex items-center space-x-4">
								<label class="inline-flex items-center">
									<input
										type="radio"
										class="h-4 w-4 text-green-600"
										bind:group={inputType}
										value="Live Feed"
									/>
									<span class="ml-2 text-gray-700">Webcam</span>
								</label>
							</div>
						</div>
					</div>

					<div class="relative mb-4 overflow-hidden rounded-lg bg-black">
						<video bind:this={videoElement} class="w-full" muted playsinline></video>
						<canvas
							bind:this={canvasElement}
							class="absolute left-0 top-0 h-full w-full"
							width="640"
							height="480"
						></canvas>
					</div>

					{#if targetPose}
						<div class="mb-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="rounded-lg bg-white p-4 shadow-sm">
									<h3 class="text-sm font-medium text-gray-500">Target Pose</h3>
									<p class="mt-1 text-xl font-semibold text-gray-900">{targetPose}</p>
								</div>
								<div class="rounded-lg bg-white p-4 shadow-sm">
									<h3 class="text-sm font-medium text-gray-500">Pose Accuracy</h3>
									<div class="mt-1 flex items-center">
										<div class="flex-1">
											<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
												<div
													class="h-full rounded-full bg-green-500 transition-all duration-300"
													style="width: {poseAccuracy}%"
												></div>
											</div>
										</div>
										<span class="ml-2 text-xl font-semibold text-gray-900">{poseAccuracy}%</span>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<div class="space-y-4">
						<button
							class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
							on:click={startLiveDetection}
						>
							<span
								class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
							></span>
							Start Detection
						</button>
						<button
							class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
							on:click={stopLiveDetection}
						>
							<span
								class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
							></span>
							Stop Detection
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Results Section -->
		{#if currentDetectedPose !== 'Unknown Pose'}
			<div class="mt-8 overflow-hidden rounded-xl bg-white shadow-md">
				<div
					class="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4"
				>
					<h2 class="flex items-center text-lg font-semibold text-gray-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Detected Pose
					</h2>
				</div>

				<div class="p-6">
					<div class="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<h3 class="text-sm font-medium text-gray-500">Pose Name</h3>
								<p class="mt-1 text-2xl font-semibold text-gray-900">{currentDetectedPose}</p>
							</div>
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<h3 class="text-sm font-medium text-gray-500">Confidence</h3>
								<p class="mt-1 text-2xl font-semibold text-gray-900">{poseConfidence}%</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Suggestions Section -->
		{#if advice}
			<div
				class="mt-8 overflow-hidden rounded-xl bg-white shadow-md"
				bind:this={suggestionsSection}
			>
				<div
					class="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4"
				>
					<h2 class="flex items-center text-lg font-semibold text-gray-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5 text-green-600"
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
						Suggested Pose
					</h2>
				</div>

				<div class="p-6">
					<div class="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<h3 class="text-sm font-medium text-gray-500">Pose Name</h3>
								<p class="mt-1 text-2xl font-semibold text-gray-900">{suggestedPose}</p>
							</div>
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<h3 class="text-sm font-medium text-gray-500">Reference Image</h3>
								<img
									src={referenceImage}
									alt="Reference Pose"
									class="mt-1 w-full rounded border border-gray-300"
								/>
							</div>
						</div>
						<div class="mt-4 rounded-lg bg-white p-4 shadow-sm">
							<h3 class="text-sm font-medium text-gray-500">Instructions</h3>
							<p class="mt-2 whitespace-pre-line text-gray-700">{advice}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Tailwind classes are used; add any additional custom CSS here if you like */
</style>
