<script>
	import { onMount } from 'svelte';
	import posePkg from '@mediapipe/pose';
	import drawingUtilsPkg from '@mediapipe/drawing_utils';
	import cameraUtilsPkg from '@mediapipe/camera_utils';

	const { Pose, POSE_CONNECTIONS } = posePkg;
	const { drawConnectors, drawLandmarks } = drawingUtilsPkg;
	const { Camera } = cameraUtilsPkg;

	let exerciseType = 'Bench Press';
	let inputSource = 'Webcam';
	let uploadedFile = null;
	let videoFileUrl = null;

	let started = false;
	let stopped = false;
	let count = 0;
	let calories = 0;
	let isActive = false;
	let lastRepTime = 0;

	const caloriesPerRep = {
		'Bench Press': 0.08,
		'Bicep Curls': 0.04,
		'Lateral Raises': 0.04,
		Squats: 0.08,
		'Push-ups': 0.4,
		'Shoulder Presses': 0.05
	};

	let pose = null;
	let camera = null;

	let videoElement;
	let canvasElement;
	let canvasCtx;

	function calculateAngle(a, b, c) {
		const ba = [a.x - b.x, a.y - b.y];
		const bc = [c.x - b.x, c.y - b.y];
		const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
		const magBA = Math.sqrt(ba[0] ** 2 + ba[1] ** 2);
		const magBC = Math.sqrt(bc[0] ** 2 + bc[1] ** 2);
		const cosAngle = dotProduct / (magBA * magBC);
		return Math.acos(Math.min(Math.max(cosAngle, -1.0), 1.0)) * (180 / Math.PI);
	}

	function onResults(results) {
		if (!results.poseLandmarks) return;

		canvasCtx.save();
		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

		drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
			color: '#00FF00',
			lineWidth: 4
		});
		drawLandmarks(canvasCtx, results.poseLandmarks, {
			color: '#FF0000',
			lineWidth: 2
		});

		canvasCtx.fillStyle = '#00FF00';
		canvasCtx.font = '20px Arial';
		canvasCtx.fillText(`Reps: ${count}`, 50, 50);
		canvasCtx.fillText(`Calories: ${calories.toFixed(2)} kcal`, 50, 80);
		canvasCtx.restore();

		const ls = results.poseLandmarks;
		const L_SHOULDER = ls[11];
		const L_ELBOW = ls[13];
		const L_WRIST = ls[15];
		const L_HIP = ls[23];
		const L_KNEE = ls[25];
		const L_ANKLE = ls[27];

		if (!L_SHOULDER || !L_ELBOW || !L_WRIST || !L_HIP || !L_KNEE || !L_ANKLE) {
			return;
		}

		const now = Date.now();
		const timeDiff = now - lastRepTime;

		if (exerciseType === 'Bench Press') {
			const angle = calculateAngle(L_SHOULDER, L_ELBOW, L_WRIST);
			if (angle < 90 && !isActive) {
				isActive = true;
			} else if (angle > 160 && isActive && timeDiff > 500) {
				count++;
				calories += caloriesPerRep[exerciseType] || 0;
				isActive = false;
				lastRepTime = now;
			}
		} else if (exerciseType === 'Bicep Curls') {
			const angle = calculateAngle(L_SHOULDER, L_ELBOW, L_WRIST);
			if (angle < 45 && !isActive) {
				isActive = true;
			} else if (angle > 160 && isActive && timeDiff > 500) {
				count++;
				calories += caloriesPerRep[exerciseType] || 0;
				isActive = false;
				lastRepTime = now;
			}
		} else if (exerciseType === 'Lateral Raises') {
			const angle = calculateAngle(L_SHOULDER, L_ELBOW, L_WRIST);
			if (angle > 90 && !isActive) {
				isActive = true;
			} else if (angle < 40 && isActive && timeDiff > 500) {
				count++;
				calories += caloriesPerRep[exerciseType] || 0;
				isActive = false;
				lastRepTime = now;
			}
		} else if (exerciseType === 'Squats') {
			const kneeAngle = calculateAngle(L_HIP, L_KNEE, L_ANKLE);
			console.log('Knee angle', kneeAngle);
			if (kneeAngle < 140 && !isActive) {
				isActive = true;
			} else if (kneeAngle > 170 && isActive && timeDiff > 500) {
				count++;
				calories += caloriesPerRep[exerciseType] || 0;
				isActive = false;
				lastRepTime = now;
			}
		} else if (exerciseType === 'Push-ups') {
			if (L_SHOULDER.y > L_ELBOW.y) {
				isActive = true;
			} else if (L_SHOULDER.y < L_ELBOW.y && isActive && timeDiff > 500) {
				count++;
				calories += caloriesPerRep[exerciseType] || 0;
				isActive = false;
				lastRepTime = now;
			}
		} else if (exerciseType === 'Shoulder Presses') {
			if (L_ELBOW.y > L_SHOULDER.y) {
				isActive = true;
			} else if (L_ELBOW.y < L_SHOULDER.y && isActive && timeDiff > 500) {
				count++;
				calories += caloriesPerRep[exerciseType] || 0;
				isActive = false;
				lastRepTime = now;
			}
		}
	}

	function startCounting() {
		count = 0;
		calories = 0;
		isActive = false;
		stopped = false;
		started = true;

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

		if (inputSource === 'Webcam') {
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
		} else {
			videoElement.play();
			requestAnimationFrame(analyzeVideoFrame);
		}
	}

	function stopCounting() {
		stopped = true;
		started = false;
		if (camera) {
			camera.stop();
		}
		videoElement.pause();
	}

	async function analyzeVideoFrame() {
		if (stopped || inputSource === 'Webcam') {
			return;
		}
		await pose.send({ image: videoElement });
		if (!videoElement.paused && !videoElement.ended) {
			requestAnimationFrame(analyzeVideoFrame);
		}
	}

	function handleFileSelect(event) {
		const input = event.target;
		if (!input.files || input.files.length === 0) return;
		uploadedFile = input.files[0];
		videoFileUrl = URL.createObjectURL(uploadedFile);
	}

	onMount(() => {
		canvasCtx = canvasElement.getContext('2d');
	});
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
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</span>
					<div>
						<h1 class="text-2xl font-bold">AI Fitness Tracking</h1>
						<p class="text-blue-100">Track your exercises with real-time pose detection</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Settings Card -->
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
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						Exercise Settings
					</h2>
				</div>

				<div class="p-6">
					<div class="mb-6">
						<label class="mb-2 block text-sm font-medium text-gray-700">Select Exercise</label>
						<select
							class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
							bind:value={exerciseType}
						>
							<option>Bench Press</option>
							<option>Bicep Curls</option>
							<option>Lateral Raises</option>
							<option>Squats</option>
							<option>Push-ups</option>
							<option>Shoulder Presses</option>
						</select>
					</div>

					<div class="mb-6">
						<label class="mb-2 block text-sm font-medium text-gray-700">Input Source</label>
						<div class="flex items-center space-x-6">
							<label class="inline-flex items-center">
								<input
									type="radio"
									class="h-4 w-4 text-blue-600"
									bind:group={inputSource}
									value="Webcam"
								/>
								<span class="ml-2 text-gray-700">Webcam</span>
							</label>
							<label class="inline-flex items-center">
								<input
									type="radio"
									class="h-4 w-4 text-blue-600"
									bind:group={inputSource}
									value="Upload Video"
								/>
								<span class="ml-2 text-gray-700">Upload Video</span>
							</label>
						</div>
					</div>

					{#if inputSource === 'Upload Video'}
						<div class="mb-6">
							<label class="mb-2 block text-sm font-medium text-gray-700"
								>Upload your workout video</label
							>
							<div
								class="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-4"
							>
								<div class="text-center">
									<svg
										class="mx-auto h-12 w-12 text-gray-300"
										stroke="currentColor"
										fill="none"
										viewBox="0 0 48 48"
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
											class="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
										>
											<span>Upload a file</span>
											<input
												type="file"
												accept="video/*"
												class="sr-only"
												on:change={handleFileSelect}
											/>
										</label>
										<p class="pl-1">or drag and drop</p>
									</div>
									<p class="text-xs text-gray-500">MP4, MOV up to 100MB</p>
								</div>
							</div>
						</div>
					{/if}

					<div class="space-y-4">
						<button
							class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
							on:click={startCounting}
						>
							<span
								class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
							></span>
							Start Tracking
						</button>
						<button
							class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
							on:click={stopCounting}
						>
							<span
								class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
							></span>
							Stop Tracking
						</button>
					</div>
				</div>
			</div>

			<!-- Video Feed Card -->
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
								d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						Live Feed
					</h2>
				</div>

				<div class="p-6">
					<div class="relative mb-4 overflow-hidden rounded-lg bg-black">
						<video bind:this={videoElement} class="w-full" src={videoFileUrl} muted playsinline
						></video>
						<canvas
							bind:this={canvasElement}
							class="absolute left-0 top-0 h-full w-full"
							width="640"
							height="480"
						></canvas>
					</div>

					<div class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<h3 class="text-sm font-medium text-gray-500">Total Reps</h3>
								<p class="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
							</div>
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<h3 class="text-sm font-medium text-gray-500">Calories Burned</h3>
								<p class="mt-1 text-2xl font-semibold text-gray-900">{calories.toFixed(2)} kcal</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
