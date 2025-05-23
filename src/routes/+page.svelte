<script lang="ts">
    import { onMount } from 'svelte';

    let animateIn = false;
    let selectedTask = null;

    // Enhanced task data for demonstration
    const tasks = [
        { id: 1, title: 'Complete project proposal', priority: 'High', dueDate: '2023-10-15', status: 'In Progress', progress: 75, category: 'Project' },
        { id: 2, title: 'Review client feedback', priority: 'Medium', dueDate: '2023-10-18', status: 'Not Started', progress: 0, category: 'Review' },
        { id: 3, title: 'Update documentation', priority: 'Low', dueDate: '2023-10-20', status: 'Completed', progress: 100, category: 'Documentation' },
        { id: 4, title: 'Prepare presentation', priority: 'High', dueDate: '2023-10-22', status: 'In Progress', progress: 45, category: 'Presentation' },
        { id: 5, title: 'Team meeting', priority: 'Medium', dueDate: '2023-10-16', status: 'Not Started', progress: 0, category: 'Meeting' },
        { id: 6, title: 'Code review session', priority: 'High', dueDate: '2023-10-17', status: 'In Progress', progress: 60, category: 'Development' },
    ];

    // Quick stats
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        pending: tasks.filter(t => t.status === 'Not Started').length
    };

    // Recent activities
    const recentActivities = [
        { action: 'Completed', item: 'Update documentation', time: '2 hours ago', type: 'success' },
        { action: 'Started', item: 'Code review session', time: '4 hours ago', type: 'info' },
        { action: 'Created', item: 'Team meeting', time: '1 day ago', type: 'info' },
    ];

    // Function to get status color
    function getStatusColor(status: string) {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    // Function to get priority color
    function getPriorityColor(priority: string) {
        switch(priority) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    function getActivityIcon(type: string) {
        switch(type) {
            case 'success': return 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'info': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        }
    }

    function getActivityColor(type: string) {
        switch(type) {
            case 'success': return 'text-green-600 bg-green-100';
            case 'info': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    onMount(() => {
        animateIn = true;
    });
</script>

<div class="h-full p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- Page Header -->
    <div class="mb-8 text-center" class:animate-fade-in={animateIn}>
        <h1 class="text-4xl font-bold text-indigo-900 mb-2">Task Dashboard</h1>
        <p class="text-indigo-600 text-lg">Manage and track your tasks efficiently</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-indigo-100 transform transition-all duration-300 hover:scale-105" class:animate-fade-in={animateIn}>
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-indigo-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p class="text-gray-600 text-sm">Total Tasks</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-green-100 transform transition-all duration-300 hover:scale-105" class:animate-fade-in={animateIn} style="animation-delay: 100ms">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-green-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{stats.completed}</h3>
            <p class="text-gray-600 text-sm">Completed</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-blue-100 transform transition-all duration-300 hover:scale-105" class:animate-fade-in={animateIn} style="animation-delay: 200ms">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{stats.inProgress}</h3>
            <p class="text-gray-600 text-sm">In Progress</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transform transition-all duration-300 hover:scale-105" class:animate-fade-in={animateIn} style="animation-delay: 300ms">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{stats.pending}</h3>
            <p class="text-gray-600 text-sm">Pending</p>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-4 mb-8" class:animate-fade-in={animateIn} style="animation-delay: 400ms">
        <a href="/calendar" class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-3 px-6 rounded-xl shadow-sm border border-indigo-200 transition-all duration-200 flex items-center hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Full Calendar
        </a>
        <a href="/dashboard/calendar" class="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Compact Calendar
        </a>
        <a href="/dashboard/stats" class="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistics
        </a>
        <button class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
        </button>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Task List -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden" class:animate-fade-in={animateIn} style="animation-delay: 500ms">
                <div class="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                    <h2 class="text-xl font-semibold text-white">Recent Tasks</h2>
                </div>
                <div class="divide-y divide-gray-100">
                    {#each tasks as task, index}
                        <div class="px-6 py-4 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group" 
                             on:click={() => selectedTask = selectedTask === task.id ? null : task.id}
                             class:bg-indigo-50={selectedTask === task.id}>
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center space-x-3 mb-2">
                                        <h3 class="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{task.title}</h3>
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getPriorityColor(task.priority)}">
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                                        <span class="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {task.dueDate}
                                        </span>
                                        <span class="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            {task.category}
                                        </span>
                                    </div>
                                    {#if selectedTask === task.id}
                                        <div class="mt-3 animate-fade-in">
                                            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                                                <span>Progress</span>
                                                <span>{task.progress}%</span>
                                            </div>
                                            <div class="w-full bg-gray-200 rounded-full h-2">
                                                <div class="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full transition-all duration-1000" style="width: {task.progress}%"></div>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                                <div class="ml-4 flex items-center space-x-3">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border {getStatusColor(task.status)}">
                                        {task.status}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Recent Activities -->
            <div class="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6" class:animate-fade-in={animateIn} style="animation-delay: 600ms">
                <h3 class="text-lg font-semibold text-indigo-900 mb-4">Recent Activities</h3>
                <div class="space-y-4">
                    {#each recentActivities as activity, index}
                        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200">
                            <div class="p-2 rounded-full {getActivityColor(activity.type)}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{getActivityIcon(activity.type)}" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900">
                                    <span class="text-indigo-600">{activity.action}</span> {activity.item}
                                </p>
                                <p class="text-xs text-gray-500">{activity.time}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6" class:animate-fade-in={animateIn} style="animation-delay: 700ms">
                <h3 class="text-lg font-semibold text-indigo-900 mb-4">Quick Actions</h3>
                <div class="space-y-3">
                    <button class="w-full text-left p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="text-sm font-medium text-gray-700">Create New Task</span>
                    </button>
                    <button class="w-full text-left p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-700">Schedule Event</span>
                    </button>
                    <a href="/dashboard/reports" class="w-full text-left p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-700">View Reports</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 0.6s ease-out forwards;
    }
</style>