<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    
    interface Task {
        id: number;
        title: string;
        description: string;
        dueDate: string;
        priority: 'high' | 'medium' | 'low';
        status: 'completed' | 'pending';
    }
    
    let tasks: Task[] = [
        {
            id: 1,
            title: 'Complete project proposal',
            description: 'Write and submit the project proposal for the new client',
            dueDate: '2024-03-25',
            priority: 'high',
            status: 'pending'
        },
        {
            id: 2,
            title: 'Team meeting',
            description: 'Weekly sync with the development team',
            dueDate: '2024-03-24',
            priority: 'medium',
            status: 'completed'
        },
        {
            id: 3,
            title: 'Review pull requests',
            description: 'Review and merge pending pull requests',
            dueDate: '2024-03-23',
            priority: 'low',
            status: 'pending'
        }
    ];

    let newTask: Omit<Task, 'id'> = {
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending'
    };

    let showNewTaskForm = false;

    function addTask() {
        if (newTask.title.trim()) {
            tasks = [...tasks, { ...newTask, id: tasks.length + 1 }];
            newTask = {
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                status: 'pending'
            };
            showNewTaskForm = false;
        }
    }

    function toggleTaskStatus(taskId: number) {
        tasks = tasks.map(task => 
            task.id === taskId 
                ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
                : task
        );
    }

    function deleteTask(taskId: number) {
        tasks = tasks.filter(task => task.id !== taskId);
    }

    const priorityColors = {
        high: 'from-red-500 to-pink-500',
        medium: 'from-yellow-500 to-orange-500',
        low: 'from-green-500 to-emerald-500'
    } as const;
</script>

<div class="min-h-screen bg-gray-900 p-6" in:fade={{ duration: 300 }}>
    <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8" in:fly={{ y: 20, duration: 400 }}>
            <h1 class="text-3xl font-bold text-white">Tasks</h1>
            <button
                on:click={() => showNewTaskForm = !showNewTaskForm}
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span>New Task</span>
            </button>
        </div>

        {#if showNewTaskForm}
            <div class="bg-gray-800 rounded-xl shadow-sm p-6 mb-6" in:fly={{ y: 20, duration: 400 }}>
                <h2 class="text-xl font-semibold text-white mb-4">Add New Task</h2>
                <form on:submit|preventDefault={addTask} class="space-y-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            bind:value={newTask.title}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            placeholder="Enter task title"
                        />
                    </div>
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            id="description"
                            bind:value={newTask.description}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            rows="3"
                            placeholder="Enter task description"
                        ></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="dueDate" class="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                bind:value={newTask.dueDate}
                                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                            />
                        </div>
                        <div>
                            <label for="priority" class="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                            <select
                                id="priority"
                                bind:value={newTask.priority}
                                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button
                            type="button"
                            on:click={() => showNewTaskForm = false}
                            class="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <div class="space-y-4">
            {#each tasks as task, i}
                <div
                    class="bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                    in:fly={{ y: 20, duration: 400, delay: i * 100 }}
                >
                    <div class="flex items-start justify-between">
                        <div class="flex items-start space-x-4">
                            <button
                                on:click={() => toggleTaskStatus(task.id)}
                                class="mt-1"
                            >
                                <div class="w-6 h-6 rounded-full border-2 {task.status === 'completed' ? 'border-green-500 bg-green-500' : 'border-gray-600'} flex items-center justify-center">
                                    {#if task.status === 'completed'}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </div>
                            </button>
                            <div>
                                <h3 class="text-lg font-medium text-white {task.status === 'completed' ? 'line-through text-gray-500' : ''}">
                                    {task.title}
                                </h3>
                                <p class="text-gray-400 mt-1">{task.description}</p>
                                <div class="flex items-center space-x-4 mt-2">
                                    <span class="text-sm text-gray-400">Due: {task.dueDate}</span>
                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r {priorityColors[task.priority]} text-white">
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            on:click={() => deleteTask(task.id)}
                            class="text-gray-500 hover:text-red-500 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            {/each}
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