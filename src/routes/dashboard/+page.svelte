<script lang="ts">
    import { user } from '$lib/stores/authStore';
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    let animateIn = $state(false);

    onMount(() => {
        animateIn = true;
    });
</script>

<div class="h-full p-6 bg-zinc-900">
    <!-- Welcome Header -->
    <div class="mb-8" class:animate-fade-in={animateIn}>
        <h1 class="text-4xl font-bold text-white mb-2">
            Welcome back{#if $user?.displayName}, {$user.displayName}{/if}!
        </h1>
        <p class="text-zinc-400 text-lg">Ready to plan your day?</p>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Calendar Card -->
        <div class="bg-zinc-800 p-6 border border-zinc-700 hover:border-green-500/50 transition-all duration-300 hover:scale-105"
             class:animate-fade-in={animateIn} style="animation-delay: 100ms;">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-green-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Calendar</h3>
            <p class="text-zinc-400 mb-4">View and manage your schedule</p>
            <a href="/calendar" class="inline-flex items-center text-green-400 hover:text-green-300 font-medium">
                Open Calendar
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </a>
        </div>

        <!-- Tasks Card -->
        <div class="bg-zinc-800 p-6 border border-zinc-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
             class:animate-fade-in={animateIn} style="animation-delay: 200ms;">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Tasks</h3>
            <p class="text-zinc-400 mb-4">Manage your to-do list</p>
            <a href="/" class="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
                View Tasks
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </a>
        </div>

        <!-- Settings Card -->
        <div class="bg-zinc-800 p-6 border border-zinc-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
             class:animate-fade-in={animateIn} style="animation-delay: 300ms;">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Settings</h3>
            <p class="text-zinc-400 mb-4">Customize your experience</p>
            <a href="/settings" class="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium">
                Open Settings
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </a>
        </div>
    </div>

    <!-- User Info -->
    {#if $user}
        <div class="bg-zinc-800 p-6 border border-zinc-700" class:animate-fade-in={animateIn} style="animation-delay: 400ms;">
            <h3 class="text-xl font-semibold text-white mb-4">Account Information</h3>
            <div class="space-y-2">
                <p class="text-zinc-300">
                    <span class="text-zinc-400">Email:</span> {$user.email}
                </p>
                {#if $user.displayName}
                    <p class="text-zinc-300">
                        <span class="text-zinc-400">Name:</span> {$user.displayName}
                    </p>
                {/if}
                <p class="text-zinc-300">
                    <span class="text-zinc-400">Account created:</span> {new Date($user.metadata.creationTime).toLocaleDateString()}
                </p>
            </div>
        </div>
    {/if}
</div>

<style>
    .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
        opacity: 0;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
