<script lang="ts">
    import { onMount } from 'svelte';

    let animateIn = $state(false);
    let selectedReport = $state('productivity');
    let dateRange = $state('last30days');
    let isGenerating = $state(false);

    let reports = {
        productivity: {
            title: 'Productivity Report',
            description: 'Analysis of task completion and time management.',
            metrics: [
                { label: 'Tasks Completed', value: 156, change: '+12%', positive: true },
                { label: 'Avg. Completion Time', value: '2.3 days', change: '-0.5 days', positive: true },
                { label: 'On-Time Delivery', value: '89%', change: '+5%', positive: true },
                { label: 'Productivity Score', value: '87/100', change: '+3', positive: true }
            ]
        },
        timeTracking: {
            title: 'Time Tracking Report',
            description: 'Breakdown of time spent across activities.',
            metrics: [
                { label: 'Total Hours Logged', value: '142.5h', change: '+8.2h', positive: true },
                { label: 'Avg. Daily Hours', value: '4.7h', change: '+0.3h', positive: true },
                { label: 'Most Productive Day', value: 'Tuesday', change: 'vs Mon', positive: false },
                { label: 'Focus Time', value: '68%', change: '+12%', positive: true }
            ]
        },
        goals: {
            title: 'Goals & Milestones',
            description: 'Progress tracking for objectives and key results.',
            metrics: [
                { label: 'Goals Achieved', value: '7/10', change: '+2', positive: true },
                { label: 'Milestone Completion', value: '85%', change: '+15%', positive: true },
                { label: 'Avg. Goal Duration', value: '18 days', change: '-3 days', positive: true },
                { label: 'Success Rate', value: '92%', change: '+7%', positive: true }
            ]
        }
    };

    let recentActivities = [
        { action: 'Completed', item: 'Project Alpha Review', time: '2 hours ago', type: 'success' },
        { action: 'Started', item: 'Design System Update', time: '4 hours ago', type: 'info' },
        { action: 'Overdue', item: 'Client Presentation', time: '1 day ago', type: 'warning' },
        { action: 'Created', item: 'Weekly Team Meeting', time: '2 days ago', type: 'info' },
        { action: 'Completed', item: 'Code Review Session', time: '3 days ago', type: 'success' }
    ];

    function generateReport() {
        isGenerating = true;
        setTimeout(() => {
            isGenerating = false;
        }, 2000);
    }

    function exportReport(format: string) {
        console.log(`Exporting ${selectedReport} report as ${format}`);
    }

    function getActivityIcon(type: string) {
        switch(type) {
            case 'success': return 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
            case 'info': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        }
    }

    function getActivityIconColor(type: string) {
        switch(type) {
            case 'success': return 'text-green-400 bg-green-500/20';
            case 'warning': return 'text-yellow-400 bg-yellow-500/20';
            case 'info': return 'text-blue-400 bg-blue-500/20';
            default: return 'text-zinc-400 bg-zinc-700/30';
        }
    }

    onMount(() => {
        animateIn = true;
    });

    let currentReport = $derived(reports[selectedReport]);
</script>

<div class="h-full p-4 sm:p-6 overflow-y-auto text-gray-300">
    <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-100 mb-1">Reports Dashboard</h1>
        <p class="text-sm text-zinc-400">Generate and analyze comprehensive reports for your projects.</p>
    </div>

    <div class="mb-6 bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="reportType" class="block text-xs font-medium text-zinc-300 mb-1.5">Report Type</label>
                <select id="reportType" bind:value={selectedReport} class="w-full bg-zinc-700/60 border border-zinc-600 text-gray-200 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500">
                    <option value="productivity">Productivity Report</option>
                    <option value="timeTracking">Time Tracking Report</option>
                    <option value="goals">Goals & Milestones</option>
                </select>
            </div>

            <div>
                <label for="dateRange" class="block text-xs font-medium text-zinc-300 mb-1.5">Date Range</label>
                <select id="dateRange" bind:value={dateRange} class="w-full bg-zinc-700/60 border border-zinc-600 text-gray-200 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500">
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>

            <div class="flex items-end">
                <button
                        on:click={generateReport}
                        disabled={isGenerating}
                        class="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500">
                    {#if isGenerating}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    {:else}
                        Generate Report
                    {/if}
                </button>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-6" class:animate-fade-in={animateIn}>
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h2 class="text-lg font-semibold text-gray-100">{currentReport.title}</h2>
                        <p class="text-zinc-400 text-sm mt-0.5">{currentReport.description}</p>
                    </div>
                    <div class="flex space-x-1.5">
                        <button
                                on:click={() => exportReport('pdf')}
                                title="Export as PDF"
                                class="p-2 text-zinc-400 hover:text-gray-100 hover:bg-zinc-700 rounded-md transition-colors duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                        <button
                                on:click={() => exportReport('excel')}
                                title="Export as Excel"
                                class="p-2 text-zinc-400 hover:text-gray-100 hover:bg-zinc-700 rounded-md transition-colors duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {#each currentReport.metrics as metric, index}
                    <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 transform transition-all duration-300 hover:border-zinc-600"
                         class:animate-fade-in={animateIn}
                         style="animation-delay: {index * 100}ms">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-sm font-medium text-zinc-300">{metric.label}</h3>
                            <span class="
                                text-xs font-semibold px-2 py-0.5 rounded-full
                                {metric.positive ? 'text-green-300 bg-green-600/30' : ''}
                                {!metric.positive ? 'text-red-300 bg-red-600/30' : ''}
                            ">
                                {metric.change}
                            </span>
                        </div>
                        <div class="text-xl font-semibold text-gray-100">{metric.value}</div>
                    </div>
                {/each}
            </div>

            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-6" class:animate-fade-in={animateIn} style="animation-delay: 400ms">
                <h3 class="text-md font-semibold text-gray-100 mb-3">Trend Analysis</h3>
                <div class="h-60 bg-zinc-700/40 rounded-md flex items-center justify-center border border-zinc-600/50">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-zinc-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p class="text-zinc-300 font-medium text-sm">Interactive Chart</p>
                        <p class="text-zinc-500 text-xs">Chart visualization would appear here.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4" class:animate-fade-in={animateIn} style="animation-delay: 500ms">
                <h3 class="text-md font-semibold text-gray-100 mb-3">Recent Activities</h3>
                <div class="space-y-3">
                    {#each recentActivities as activity}
                        <div class="flex items-start space-x-3 p-2.5 rounded-md hover:bg-zinc-700/60 transition-colors duration-150">
                            <div class="p-1.5 rounded-full {getActivityIconColor(activity.type)} shrink-0 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    {@html getActivityIcon(activity.type)}
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-200">
                                    <span class:text-green-400={activity.type === 'success'}
                                          class:text-yellow-400={activity.type === 'warning'}
                                          class:text-blue-400={activity.type === 'info'}>
                                        {activity.action}
                                    </span>
                                    {activity.item}
                                </p>
                                <p class="text-xs text-zinc-400">{activity.time}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4" class:animate-fade-in={animateIn} style="animation-delay: 600ms">
                <h3 class="text-md font-semibold text-gray-100 mb-3">Quick Actions</h3>
                <div class="space-y-2">
                    <button class="w-full text-left p-2.5 rounded-md hover:bg-zinc-700/60 transition-colors duration-150 flex items-center space-x-2.5 group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400 group-hover:text-gray-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Schedule Report</span>
                    </button>
                    <button class="w-full text-left p-2.5 rounded-md hover:bg-zinc-700/60 transition-colors duration-150 flex items-center space-x-2.5 group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400 group-hover:text-gray-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Email Report</span>
                    </button>
                    <button class="w-full text-left p-2.5 rounded-md hover:bg-zinc-700/60 transition-colors duration-150 flex items-center space-x-2.5 group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400 group-hover:text-gray-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Customize Report</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in {
        animation: fade-in 0.5s ease-out forwards;
    }
</style>