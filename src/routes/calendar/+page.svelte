<script lang="ts">
    import { onMount } from 'svelte';
    
    // Calendar data
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Sample events/tasks data
    const events = [
        { 
            id: 1, 
            title: 'Team Meeting', 
            date: new Date(currentYear, currentMonth, 15, 10, 0), 
            endDate: new Date(currentYear, currentMonth, 15, 11, 30),
            color: 'bg-indigo-500'
        },
        { 
            id: 2, 
            title: 'Project Deadline', 
            date: new Date(currentYear, currentMonth, 22, 14, 0), 
            endDate: new Date(currentYear, currentMonth, 22, 15, 0),
            color: 'bg-red-500'
        },
        { 
            id: 3, 
            title: 'Client Call', 
            date: new Date(currentYear, currentMonth, 8, 9, 0), 
            endDate: new Date(currentYear, currentMonth, 8, 10, 0),
            color: 'bg-green-500'
        },
        { 
            id: 4, 
            title: 'Review Session', 
            date: new Date(currentYear, currentMonth, 18, 13, 0), 
            endDate: new Date(currentYear, currentMonth, 18, 14, 30),
            color: 'bg-amber-500'
        },
        { 
            id: 5, 
            title: 'Planning', 
            date: new Date(currentYear, currentMonth, 10, 15, 0), 
            endDate: new Date(currentYear, currentMonth, 10, 16, 0),
            color: 'bg-purple-500'
        }
    ];
    
    // Calendar state
    let calendarDays = [];
    let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // New event form
    let showNewEventForm = false;
    let newEvent = {
        title: '',
        date: '',
        time: '',
        duration: 60 // minutes
    };
    
    // Generate calendar days for the current month
    function generateCalendarDays() {
        calendarDays = [];
        
        // Get first day of the month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Get last day of the month
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        
        // Get days from previous month to fill first week
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        
        // Add previous month days
        for (let i = startingDay - 1; i >= 0; i--) {
            calendarDays.push({
                day: prevMonthLastDay - i,
                currentMonth: false,
                date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i)
            });
        }
        
        // Add current month days
        for (let i = 1; i <= totalDays; i++) {
            calendarDays.push({
                day: i,
                currentMonth: true,
                today: i === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear(),
                date: new Date(currentYear, currentMonth, i)
            });
        }
        
        // Add next month days to complete the grid (6 rows x 7 columns = 42 cells)
        const remainingDays = 42 - calendarDays.length;
        for (let i = 1; i <= remainingDays; i++) {
            calendarDays.push({
                day: i,
                currentMonth: false,
                date: new Date(currentYear, currentMonth + 1, i)
            });
        }
    }
    
    // Navigate to previous month
    function prevMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        generateCalendarDays();
    }
    
    // Navigate to next month
    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        generateCalendarDays();
    }
    
    // Get events for a specific day
    function getEventsForDay(date) {
        return events.filter(event => 
            event.date.getDate() === date.getDate() && 
            event.date.getMonth() === date.getMonth() && 
            event.date.getFullYear() === date.getFullYear()
        );
    }
    
    // Format time (HH:MM)
    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Toggle new event form
    function toggleNewEventForm() {
        showNewEventForm = !showNewEventForm;
        if (showNewEventForm) {
            // Initialize with current date
            const now = new Date();
            newEvent = {
                title: '',
                date: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
                time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
                duration: 60
            };
        }
    }
    
    // Add new event
    function addNewEvent() {
        if (newEvent.title && newEvent.date && newEvent.time) {
            const [year, month, day] = newEvent.date.split('-').map(Number);
            const [hours, minutes] = newEvent.time.split(':').map(Number);
            
            const startDate = new Date(year, month - 1, day, hours, minutes);
            const endDate = new Date(startDate.getTime() + newEvent.duration * 60000);
            
            const colors = ['bg-indigo-500', 'bg-red-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            events.push({
                id: events.length + 1,
                title: newEvent.title,
                date: startDate,
                endDate: endDate,
                color: randomColor
            });
            
            // Close form and regenerate calendar
            showNewEventForm = false;
            events = [...events]; // Trigger reactivity
            generateCalendarDays();
        }
    }
    
    // Initialize calendar on mount
    onMount(() => {
        generateCalendarDays();
    });
</script>

<div class="h-full">
    <!-- Page Header -->
    <div class="mb-4 flex justify-between items-center">
        <div>
            <h1 class="text-2xl font-bold text-indigo-900">Calendar</h1>
            <p class="text-indigo-600 mt-1">Manage your schedule and events</p>
        </div>
        
        <button 
            on:click={toggleNewEventForm}
            class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-sm border border-indigo-200 transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Event
        </button>
    </div>
    
    <!-- New Event Form (Modal) -->
    {#if showNewEventForm}
        <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 class="text-xl font-bold text-indigo-900 mb-4">Add New Event</h2>
                
                <div class="space-y-4">
                    <div>
                        <label for="event-title" class="block text-sm font-medium text-indigo-700 mb-1">Event Title</label>
                        <input 
                            type="text" 
                            id="event-title" 
                            bind:value={newEvent.title}
                            class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter event title"
                        />
                    </div>
                    
                    <div>
                        <label for="event-date" class="block text-sm font-medium text-indigo-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            id="event-date" 
                            bind:value={newEvent.date}
                            class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label for="event-time" class="block text-sm font-medium text-indigo-700 mb-1">Time</label>
                        <input 
                            type="time" 
                            id="event-time" 
                            bind:value={newEvent.time}
                            class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label for="event-duration" class="block text-sm font-medium text-indigo-700 mb-1">Duration (minutes)</label>
                        <input 
                            type="number" 
                            id="event-duration" 
                            bind:value={newEvent.duration}
                            min="15"
                            step="15"
                            class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end space-x-3">
                    <button 
                        on:click={toggleNewEventForm}
                        class="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
                        Cancel
                    </button>
                    <button 
                        on:click={addNewEvent}
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200">
                        Add Event
                    </button>
                </div>
            </div>
        </div>
    {/if}
    
    <!-- Calendar Navigation -->
    <div class="flex justify-between items-center mb-4 bg-white rounded-lg shadow-sm p-3 border border-indigo-100">
        <button 
            on:click={prevMonth}
            class="p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        
        <h2 class="text-lg font-semibold text-indigo-900">{monthNames[currentMonth]} {currentYear}</h2>
        
        <button 
            on:click={nextMonth}
            class="p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </div>
    
    <!-- Calendar Grid -->
    <div class="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 bg-indigo-50 border-b border-indigo-100">
            {#each weekdays as day}
                <div class="p-2 text-center text-xs font-semibold text-indigo-800">{day}</div>
            {/each}
        </div>
        
        <!-- Calendar Days -->
        <div class="grid grid-cols-7 auto-rows-fr">
            {#each calendarDays as day, index}
                <div 
                    class="min-h-[100px] p-1 border-b border-r border-indigo-100 relative {day.currentMonth ? 'bg-white' : 'bg-gray-50'} {day.today ? 'ring-2 ring-indigo-300 ring-inset' : ''}"
                >
                    <!-- Day Number -->
                    <div class="text-xs font-medium {day.currentMonth ? 'text-indigo-900' : 'text-gray-400'} {day.today ? 'bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center' : ''}">{day.day}</div>
                    
                    <!-- Events for this day -->
                    <div class="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                        {#each getEventsForDay(day.date) as event}
                            <div class="text-xs p-1 rounded-md {event.color} text-white truncate shadow-sm">
                                <span class="font-medium">{formatTime(event.date)}</span> {event.title}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
