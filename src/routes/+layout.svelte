<script lang="ts">
	import '../app.css';

	let { children } = $props();
    let sidebarOpen = true;

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
</script>
<div class="h-screen w-full bg-gradient-to-br from-amber-200 to-amber-300 overflow-hidden">
    <div class="flex h-full">
        <!-- Sidebar -->
        <div class="relative">
            <!-- Sidebar Content -->
            <div class="h-full bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden"
                 class:w-64={sidebarOpen}
                 class:w-20={!sidebarOpen}>

                <!-- Logo Section -->
                <div class="p-4 flex items-center justify-between border-b border-indigo-100">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            G
                        </div>
                        {#if sidebarOpen}
                            <span class="ml-3 text-xl font-semibold text-indigo-800 transition-opacity duration-300">Gemini AI</span>
                        {/if}
                    </div>
                </div>

                <!-- Navigation Links -->
                <nav class="mt-6 px-4">
                    <ul class="space-y-2">
                        <li>
                            <a href="/" class="flex items-center p-3 text-indigo-800 rounded-lg hover:bg-indigo-100 transition-all duration-200 group">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                {#if sidebarOpen}
                                    <span class="ml-3 transition-opacity duration-300">Dashboard</span>
                                {/if}
                            </a>
                        </li>
                        <li>
                            <a href="/tasks" class="flex items-center p-3 text-indigo-800 rounded-lg hover:bg-indigo-100 transition-all duration-200 group">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {#if sidebarOpen}
                                    <span class="ml-3 transition-opacity duration-300">Tasks</span>
                                {/if}
                            </a>
                        </li>
                        <li>
                            <a href="/calendar" class="flex items-center p-3 text-indigo-800 rounded-lg hover:bg-indigo-100 transition-all duration-200 group">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {#if sidebarOpen}
                                    <span class="ml-3 transition-opacity duration-300">Calendar</span>
                                {/if}
                            </a>
                        </li>
                        <li>
                            <a href="/analytics" class="flex items-center p-3 text-indigo-800 rounded-lg hover:bg-indigo-100 transition-all duration-200 group">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                {#if sidebarOpen}
                                    <span class="ml-3 transition-opacity duration-300">Analytics</span>
                                {/if}
                            </a>
                        </li>
                    </ul>
                </nav>

                <!-- Bottom Section with Settings and Toggle Button -->
                <div class="absolute bottom-0 w-full border-t border-indigo-100 p-4">
                    <div class="flex flex-col space-y-4">
                        <a href="/settings" class="flex items-center p-3 text-indigo-800 rounded-lg hover:bg-indigo-100 transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {#if sidebarOpen}
                                <span class="ml-3 transition-opacity duration-300">Settings</span>
                            {/if}
                        </a>

                        <!-- Toggle Button -->
                        <button
                            on:click={toggleSidebar}
                            class="p-2 bg-white rounded-lg shadow-md hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center">
                            {#if sidebarOpen}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto p-6">
            <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 min-h-full">
                {@render children()}
            </div>
        </div>
    </div>
</div>
