<script lang="ts">
    // Task data for demonstration
    const tasks = [
        { id: 1, title: 'Complete project proposal', priority: 'High', dueDate: '2023-10-15', status: 'In Progress' },
        { id: 2, title: 'Review client feedback', priority: 'Medium', dueDate: '2023-10-18', status: 'Not Started' },
        { id: 3, title: 'Update documentation', priority: 'Low', dueDate: '2023-10-20', status: 'Completed' },
        { id: 4, title: 'Prepare presentation', priority: 'High', dueDate: '2023-10-22', status: 'In Progress' },
        { id: 5, title: 'Team meeting', priority: 'Medium', dueDate: '2023-10-16', status: 'Not Started' },
    ];

    // Function to get status color
    function getStatusColor(status: string) {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Not Started': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    // Function to get priority color
    function getPriorityColor(priority: string) {
        switch(priority) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
</script>

<div class="h-full">
    <!-- Page Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-indigo-900">Task Dashboard</h1>
        <p class="text-indigo-600 mt-1">Manage and track your tasks efficiently</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-3 mb-6">
        <a href="/calendar" class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-sm border border-indigo-200 transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar View
        </a>
        <a href="/dashboard/calendar" class="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Compact Calendar
        </a>
        <button class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-sm border border-indigo-200 transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Task
        </button>

        <button class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-sm border border-indigo-200 transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
        </button>

        <button class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-sm border border-indigo-200 transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
        </button>
    </div>

    <!-- Task List -->
    <div class="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-indigo-100">
                <thead class="bg-indigo-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Task</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Priority</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Due Date</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-indigo-50">
                    {#each tasks as task}
                        <tr class="hover:bg-indigo-50 transition-colors duration-150">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-indigo-900">{task.title}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getPriorityColor(task.priority)}">
                                    {task.priority}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{task.dueDate}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(task.status)}">
                                    {task.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex space-x-2">
                                    <button class="text-indigo-600 hover:text-indigo-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="text-red-600 hover:text-red-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>