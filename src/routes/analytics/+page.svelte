<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    interface StatCard {
        title: string;
        value: string | number;
        change: number;
        color: string;
        icon: string;
    }
    
    interface ChartData {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            color: string;
        }[];
    }
    
    let stats: StatCard[] = [
        {
            title: 'Tasks Completed',
            value: '24',
            change: 12,
            color: 'from-blue-500 to-cyan-500',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>`
        },
        {
            title: 'Productivity Score',
            value: '85%',
            change: 5,
            color: 'from-purple-500 to-pink-500',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>`
        },
        {
            title: 'Notes Created',
            value: '12',
            change: -2,
            color: 'from-orange-500 to-yellow-500',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>`
        },
        {
            title: 'Focus Time',
            value: '4.5h',
            change: 0.5,
            color: 'from-green-500 to-emerald-500',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`
        }
    ];

    let productivityData: ChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Tasks',
                data: [4, 6, 3, 5, 7, 2, 4],
                color: 'from-blue-500 to-cyan-500'
            },
            {
                label: 'Notes',
                data: [2, 3, 1, 4, 2, 1, 3],
                color: 'from-purple-500 to-pink-500'
            }
        ]
    };

    let timeDistributionData: ChartData = {
        labels: ['Work', 'Meetings', 'Planning', 'Break'],
        datasets: [
            {
                label: 'Hours',
                data: [4.5, 2, 1.5, 1],
                color: 'from-orange-500 to-yellow-500'
            }
        ]
    };

    let isLoaded = false;
    
    onMount(() => {
        isLoaded = true;
    });
</script>

<div class="min-h-screen bg-gray-900 p-6" in:fade={{ duration: 300 }}>
    <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-8" in:fly={{ y: 20, duration: 400 }}>
            Analytics
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {#each stats as stat, i}
                <div
                    class="bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                    in:fly={{ y: 20, duration: 400, delay: i * 100 }}
                >
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-r {stat.color} flex items-center justify-center text-white">
                            {@html stat.icon}
                        </div>
                        <span class="text-sm font-medium {stat.change >= 0 ? 'text-green-500' : 'text-red-500'}">
                            {stat.change >= 0 ? '+' : ''}{stat.change}%
                        </span>
                    </div>
                    <h3 class="text-lg font-semibold text-white">{stat.value}</h3>
                    <p class="text-sm text-gray-400">{stat.title}</p>
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-gray-800 rounded-xl shadow-sm p-6" in:fly={{ y: 20, duration: 400, delay: 400 }}>
                <h2 class="text-xl font-semibold text-white mb-6">Weekly Activity</h2>
                <div class="h-64">
                    <div class="flex items-end h-48 space-x-2">
                        {#each productivityData.datasets[0].data as value, i}
                            <div class="flex-1 flex flex-col items-center">
                                <div 
                                    class="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg"
                                    style="height: {value * 10}%"
                                ></div>
                                <span class="text-xs text-gray-400 mt-2">{productivityData.labels[i]}</span>
                            </div>
                        {/each}
                    </div>
                    <div class="flex justify-center space-x-4 mt-4">
                        {#each productivityData.datasets as dataset}
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-gradient-to-r {dataset.color} mr-2"></div>
                                <span class="text-sm text-gray-400">{dataset.label}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl shadow-sm p-6" in:fly={{ y: 20, duration: 400, delay: 500 }}>
                <h2 class="text-xl font-semibold text-white mb-6">Time Distribution</h2>
                <div class="h-64">
                    <div class="flex items-center h-48 space-x-4">
                        {#each timeDistributionData.datasets[0].data as value, i}
                            <div class="flex-1 flex flex-col items-center">
                                <div 
                                    class="w-full bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t-lg"
                                    style="height: {value * 20}%"
                                ></div>
                                <span class="text-xs text-gray-400 mt-2">{timeDistributionData.labels[i]}</span>
                            </div>
                        {/each}
                    </div>
                    <div class="flex justify-center space-x-4 mt-4">
                        {#each timeDistributionData.datasets as dataset}
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-gradient-to-r {dataset.color} mr-2"></div>
                                <span class="text-sm text-gray-400">{dataset.label}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Add smooth transitions for all interactive elements */
    button {
        transition: all 0.3s ease;
    }
    
    /* Add hover effects */
    .hover\:shadow-md:hover {
        transform: translateY(-2px);
    }
</style> 