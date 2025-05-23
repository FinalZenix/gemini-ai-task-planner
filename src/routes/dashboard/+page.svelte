<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    
    let isLoaded = false;
    
    onMount(() => {
        isLoaded = true;
    });

    const dashboardItems = [
        {
            title: 'Calendar',
            description: 'View and manage your schedule',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>`,
            color: 'from-blue-500 to-cyan-500',
            href: '/calendar'
        },
        {
            title: 'Tasks',
            description: 'Manage your daily tasks',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>`,
            color: 'from-purple-500 to-pink-500',
            href: '/tasks'
        },
        {
            title: 'Notes',
            description: 'Quick notes and reminders',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>`,
            color: 'from-orange-500 to-yellow-500',
            href: '/notes'
        },
        {
            title: 'Analytics',
            description: 'Track your productivity',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>`,
            color: 'from-green-500 to-emerald-500',
            href: '/analytics'
        }
    ];
</script>

<div class="min-h-screen bg-gray-900 p-6" in:fade={{ duration: 300 }}>
    <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-8" in:fly={{ y: 20, duration: 400 }}>
            Dashboard
        </h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each dashboardItems as item, i}
                <a 
                    href={item.href}
                    class="group relative bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    in:fly={{ y: 20, duration: 400, delay: i * 100 }}
                >
                    <div class="absolute inset-0 bg-gradient-to-r {item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div class="p-6">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-r {item.color} flex items-center justify-center text-white mb-4">
                            {@html item.icon}
                        </div>
                        <h2 class="text-xl font-semibold text-white mb-2">{item.title}</h2>
                        <p class="text-gray-400">{item.description}</p>
                    </div>
                </a>
            {/each}
        </div>

        <div class="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-gray-800 rounded-xl shadow-sm p-6" in:fly={{ y: 20, duration: 400, delay: 400 }}>
                <h2 class="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div class="space-y-4">
                    {#each [1,2,3] as i}
                        <div class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                                <span class="text-sm font-medium">{i}</span>
                            </div>
                            <div>
                                <p class="text-white font-medium">Activity {i}</p>
                                <p class="text-sm text-gray-400">2 hours ago</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl shadow-sm p-6" in:fly={{ y: 20, duration: 400, delay: 500 }}>
                <h2 class="text-xl font-semibold text-white mb-4">Quick Stats</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <p class="text-sm opacity-80">Tasks Completed</p>
                        <p class="text-2xl font-bold">12</p>
                    </div>
                    <div class="p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <p class="text-sm opacity-80">Productivity</p>
                        <p class="text-2xl font-bold">85%</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Add smooth transitions for all interactive elements */
    a, button {
        transition: all 0.3s ease;
    }
    
    /* Add hover effects */
    .group:hover {
        transform: translateY(-2px);
    }
</style>
