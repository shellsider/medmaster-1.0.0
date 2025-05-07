<script>
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	import axios from 'axios';

	let currentUser = '';
	let chatWith = '';
	const chatHistory = writable([]);
	let newMessage = '';
	let fileToUpload = null;
	let fileUploading = false;
	let error = '';

	let chatHistoryContainer;
	let isUserScrolling = false;
	let isAtBottom = true;

	let pollingInterval;

	async function getSession() {
		try {
			const res = await axios.get('/api/session');
			if (res.data && res.data.currentUser) {
				currentUser = res.data.currentUser;
			} else {
				window.location.href = '/user/auth';
			}
		} catch (error) {
			console.error('Error retrieving session:', error);
			window.location.href = '/user/auth';
		}
	}

	async function fetchChatHistory() {
		if (!chatWith) return;
		try {
			const response = await axios.get('/api/chat', {
				params: { user: currentUser, with: chatWith }
			});
			if (response.data) {
				chatHistory.set(response.data.messages);
				if (isAtBottom) {
					scrollToBottom();
				}
			}
		} catch (error) {
			console.error('Error fetching chat history:', error);
		}
	}

	function handleFileChange(event) {
		fileToUpload = event.target.files ? event.target.files[0] : null;
	}

	async function sendMessage() {
		if (!chatWith) {
			alert('Please enter a username to chat with.');
			return;
		}
		if (!newMessage && !fileToUpload) {
			alert('Please enter a message or select a file to send.');
			return;
		}

		let filePath = null;

		if (fileToUpload) {
			fileUploading = true;
			const formData = new FormData();
			formData.append('file', fileToUpload);
			try {
				const uploadRes = await axios.post('/api/upload', formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
				filePath = uploadRes.data.filePath;
			} catch (error) {
				console.error('Error uploading file:', error);
				alert('Error uploading file.');
				fileUploading = false;
				return;
			}
			fileUploading = false;
		}

		const payload = {
			sender: currentUser,
			receiver: chatWith,
			message: newMessage,
			filePath: filePath
		};

		try {
			const res = await axios.post('/api/chat', payload, {
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.data.success) {
				newMessage = '';
				fileToUpload = null;
				fetchChatHistory();
				scrollToBottom();
			} else {
				alert('Failed to send message.');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			alert('Failed to send message.');
		}
	}

	function handleScroll() {
		if (chatHistoryContainer) {
			const { scrollTop, scrollHeight, clientHeight } = chatHistoryContainer;
			isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;
			isUserScrolling = !isAtBottom;
		}
	}

	function scrollToBottom() {
		if (chatHistoryContainer) {
			chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
		}
	}

	function handleKeypress(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	onMount(async () => {
		await getSession();
		pollingInterval = setInterval(fetchChatHistory, 2000);
	});

	onDestroy(() => {
		clearInterval(pollingInterval);
	});

	afterUpdate(() => {
		if (isAtBottom) {
			scrollToBottom();
		}
	});
</script>

<div class="space-y-8">
	<!-- Header Section -->
	<div
		class="mb-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg"
	>
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
						d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
					/>
				</svg>
			</span>
			<div>
				<h1 class="text-2xl font-bold">Medical Chat</h1>
				<p class="text-blue-100">Connect with healthcare professionals securely</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Chat Input Section -->
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
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						Start a Conversation
					</h2>
				</div>

				<div class="p-6">
					<div class="mb-4">
						<label for="chatWith" class="mb-2 block text-sm font-medium text-gray-700">
							Chat with (enter email):
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
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<input
								id="chatWith"
								type="text"
								bind:value={chatWith}
								placeholder="Enter user's email"
								class="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
							/>
						</div>
					</div>

					<button
						on:click={fetchChatHistory}
						class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
					>
						Load Chat
					</button>
				</div>
			</div>
		</div>

		<!-- Chat History Section -->
		<div class="lg:col-span-2">
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
						Chat History
					</h2>
				</div>

				<div class="p-6">
					<div
						class="chat-history flex flex-col space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4"
						style="max-height: 400px;"
						bind:this={chatHistoryContainer}
						on:scroll={handleScroll}
					>
						{#if $chatHistory.length > 0}
							{#each $chatHistory as msg (msg.id)}
								<div
									class="message word-wrap max-w-[75%] rounded-lg p-4 shadow-md
										{msg.sender === currentUser
										? 'self-end bg-blue-600 text-white'
										: 'self-start bg-white text-gray-800'}"
								>
									<p>
										<strong
											class="text-sm {msg.sender === currentUser
												? 'text-blue-100'
												: 'text-gray-500'}">{msg.sender}</strong
										>
										<br />
										<span class="mt-1 block">{msg.message}</span>
									</p>
									{#if msg.file_path}
										<a
											href="{msg.file_path}?fl_attachment=true"
											download
											target="_blank"
											rel="noopener noreferrer"
											class="mt-2 inline-flex items-center text-sm {msg.sender === currentUser
												? 'text-blue-200 hover:text-blue-100'
												: 'text-blue-600 hover:text-blue-700'}"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="mr-1 h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
												/>
											</svg>
											Download File
										</a>
									{/if}
									<span
										class="mt-2 block text-xs {msg.sender === currentUser
											? 'text-blue-200'
											: 'text-gray-500'}">{new Date(msg.timestamp).toLocaleString()}</span
									>
								</div>
							{/each}
						{:else}
							<div
								class="flex h-56 flex-col items-center justify-center rounded-lg bg-white p-8 text-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mb-4 h-12 w-12 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
								<p class="text-gray-600">No messages yet. Start a conversation!</p>
							</div>
						{/if}
					</div>

					<div class="mt-6">
						<div class="relative">
							<textarea
								bind:value={newMessage}
								placeholder="Type your message..."
								class="w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
								on:keypress={handleKeypress}
								rows="3"
							></textarea>
						</div>

						<div class="mt-4 flex items-center justify-between">
							<label
								class="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-2 h-5 w-5 text-gray-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
									/>
								</svg>
								Attach File
								<input type="file" class="hidden" on:change={handleFileChange} />
							</label>

							{#if fileUploading}
								<div class="flex items-center text-sm text-gray-500">
									<div
										class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
									></div>
									Uploading...
								</div>
							{/if}
						</div>

						<button
							on:click={sendMessage}
							class="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
						>
							Send Message
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.chat-history {
		max-height: 400px;
		overflow-y: auto;
	}
	.message {
		word-wrap: break-word;
	}
</style>
