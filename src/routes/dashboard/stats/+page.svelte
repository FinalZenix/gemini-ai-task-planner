<script lang="ts">
    import { onMount } from 'svelte';

    let animateIn = $state(false);
    let selectedPeriod = $state('week');

    let taskStats = $state({
        completed: 24,
        inProgress: 8,
        pending: 12,
        overdue: 3
    });

    const weeklyData = [
        { day: 'Mon', completed: 4, created: 6 },
        { day: 'Tue', completed: 6, created: 4 },
        { day: 'Wed', completed: 3, created: 8 },
        { day: 'Thu', completed: 8, created: 5 },
        { day: 'Fri', completed: 5, created: 7 },
        { day: 'Sat', completed: 2, created: 3 },
        { day: 'Sun', completed: 1, created: 2 }
    ];

    let productivityScore = $state(87);
    let streakDays = $state(12);
    let totalHours = $state(34.5);

    const stats = $derived([
        { title: 'Completed Tasks', value: taskStats.completed, change: '+12%', color: 'green', iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { title: 'In Progress', value: taskStats.inProgress, change: '-3%', color: 'sky', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { title: 'Pending Tasks', value: taskStats.pending, change: '+5%', color: 'amber', iconPath: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
        { title: 'Overdue Tasks', value: taskStats.overdue, change: '-8%', color: 'red', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' }
    ]);

    const completionRate = $derived(() => {
        const total = taskStats.completed + taskStats.inProgress + taskStats.pending + taskStats.overdue;
        if (total === 0) return 0;
        return Math.round((taskStats.completed / total) * 100);
    });

    function getMaxValue(data: { [key: string]: any }[], key: string) {
        if (!data || data.length === 0) return 1;
        return Math.max(1, ...data.map(item => item[key]));
    }

    const maxCompleted = getMaxValue(weeklyData, 'completed');
    const maxCreated = getMaxValue(weeklyData, 'created');

    function getBarHeight(value: number, maxValue: number) {
        return (value / Math.max(1, maxValue)) * 100;
    }

    onMount(() => {
        animateIn = true;
    });
</script>

<div class="h-full p-4 sm:p-6 text-gray-300 overflow-y-auto">
    <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-100 mb-1">Statistics Dashboard</h1>
        <p class="text-sm text-zinc-400">Track your productivity and performance.</p>
    </div>

    <div class="mb-6 flex space-x-2">
        {#each ['week', 'month', 'year'] as period}
            <button
                    class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-green-500
                       {selectedPeriod === period ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
                    on:click={() => selectedPeriod = period}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
        {/each}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {#each stats as stat, index}
            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-5 {animateIn ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: {index * 100}ms">
                <div class="flex items-center justify-between mb-3">
                    <div class="p-2 rounded-md
                        {stat.color === 'green' ? 'bg-green-500/20' : ''}
                        {stat.color === 'sky' ? 'bg-sky-500/20' : ''}
                        {stat.color === 'amber' ? 'bg-amber-500/20' : ''}
                        {stat.color === 'red' ? 'bg-red-500/20' : ''}
                    ">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5
                            {stat.color === 'green' ? 'text-green-400' : ''}
                            {stat.color === 'sky' ? 'text-sky-400' : ''}
                            {stat.color === 'amber' ? 'text-amber-400' : ''}
                            {stat.color === 'red' ? 'text-red-400' : ''}
                        " fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d={stat.iconPath} />
                        </svg>
                    </div>
                    <span class="text-xs font-medium
                        {stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}
                    ">{stat.change}</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-semibold text-gray-100 mb-0.5">{stat.value}</h3>
                <p class="text-xs sm:text-sm text-zinc-400">{stat.title}</p>
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-6 {animateIn ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: 400ms">
            <h3 class="text-base sm:text-lg font-semibold text-gray-100 mb-4 sm:mb-6">Weekly Activity</h3>
            <div class="space-y-3 sm:space-y-4">
                {#each weeklyData as dayData, index}
                    <div class="flex items-center space-x-2 sm:space-x-4">
                        <div class="w-8 text-xs sm:text-sm font-medium text-zinc-400 text-right">{dayData.day}</div>
                        <div class="flex-1 grid grid-cols-2 gap-1 sm:gap-2">
                            <div class="bg-zinc-700 rounded-sm h-5 sm:h-6 relative overflow-hidden">
                                <div
                                        class="bg-green-500 h-full rounded-sm transition-all duration-1000 ease-out flex items-center justify-center"
                                        style="width: {getBarHeight(dayData.completed, maxCompleted)}%; animation-delay: {index * 100}ms">
                                    <span class="text-xs font-medium text-white opacity-80 mix-blend-overlay sm:mix-blend-normal">{dayData.completed}</span>
                                </div>
                            </div>
                            <div class="bg-zinc-700 rounded-sm h-5 sm:h-6 relative overflow-hidden">
                                <div
                                        class="bg-sky-500 h-full rounded-sm transition-all duration-1000 ease-out flex items-center justify-center"
                                        style="width: {getBarHeight(dayData.created, maxCreated)}%; animation-delay: {index * 100 + 50}ms">
                                    <span class="text-xs font-medium text-white opacity-80 mix-blend-overlay sm:mix-blend-normal">{dayData.created}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
            <div class="flex justify-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 text-xs sm:text-sm">
                <div class="flex items-center space-x-1.5">
                    <div class="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <span class="text-zinc-400">Completed</span>
                </div>
                <div class="flex items-center space-x-1.5">
                    <div class="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>
                    <span class="text-zinc-400">Created</span>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-6 {animateIn ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: 500ms">
                <h3 class="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Completion Rate</h3>
                <div class="flex items-center space-x-3 sm:space-x-4">
                    <div class="relative w-16 h-16 sm:w-20 sm:h-20">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-zinc-700" stroke="currentColor" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <path class="text-green-500" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="{completionRate}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-base sm:text-lg font-semibold text-gray-100">{completionRate}%</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-zinc-300">Tasks completed this {selectedPeriod}</p>
                        <p class="text-xs text-green-400 font-medium">+5% from last {selectedPeriod}</p>
                    </div>
                </div>
            </div>

            <div class="bg-zinc-800 rounded-md border border-zinc-700 p-4 sm:p-6 {animateIn ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: 600ms">
                <h3 class="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Productivity Score</h3>
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xl sm:text-2xl font-semibold text-purple-400">{productivityScore}</span>
                    <span class="text-xs sm:text-sm text-purple-400 font-medium">Excellent</span>
                </div>
                <div class="w-full bg-zinc-700 rounded-full h-1.5 sm:h-2">
                    <div class="bg-purple-500 h-full rounded-full transition-all duration-1000" style="width: {productivityScore}%"></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-zinc-800 rounded-md border border-zinc-700 p-3 sm:p-4 text-center {animateIn ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: 700ms">
                    <div class="text-lg sm:text-xl font-semibold text-orange-400">{streakDays}</div>
                    <div class="text-xs text-zinc-400">Day Streak</div>
                </div>
                <div class="bg-zinc-800 rounded-md border border-zinc-700 p-3 sm:p-4 text-center {animateIn ? 'animate-fade-in' : 'opacity-0'}" style="animation-delay: 800ms">
                    <div class="text-lg sm:text-xl font-semibold text-cyan-400">{totalHours}h</div>
                    <div class="text-xs text-zinc-400">Total Hours</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(15px);
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