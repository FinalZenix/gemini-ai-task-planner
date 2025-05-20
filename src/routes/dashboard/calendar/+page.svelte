<script lang="ts">
    import { onMount } from 'svelte';

    // Calendar data
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let currentWeek = getWeekNumber(currentDate);

    // View settings
    let viewMode = 'month'; // 'month' or 'week'
    let showFullTimeRange = false; // Default to limited time range (4am-10pm)

    // Week view settings
    let weekViewDays = [];
    let timeSlots = [];
    let draggedEvent = null;
    let draggedEventOriginalTime = null;

    // Sample events/tasks data
    let events = [
        {
            id: 1,
            title: 'Team Meeting',
            date: new Date(currentYear, currentMonth, 15, 10, 0),
            endDate: new Date(currentYear, currentMonth, 15, 11, 30),
            color: 'bg-pink-500'
        },
        {
            id: 2,
            title: 'Project Deadline',
            date: new Date(currentYear, currentMonth, 22, 14, 0),
            endDate: new Date(currentYear, currentMonth, 22, 15, 0),
            color: 'bg-orange-500'
        },
        {
            id: 3,
            title: 'Client Call',
            date: new Date(currentYear, currentMonth, 8, 9, 0),
            endDate: new Date(currentYear, currentMonth, 8, 10, 0),
            color: 'bg-cyan-500'
        },
        {
            id: 4,
            title: 'Morning Workout',
            date: new Date(currentYear, currentMonth, currentDate.getDate(), 6, 0),
            endDate: new Date(currentYear, currentMonth, currentDate.getDate(), 7, 0),
            color: 'bg-green-500'
        },
        {
            id: 5,
            title: 'Lunch with Client',
            date: new Date(currentYear, currentMonth, currentDate.getDate(), 12, 30),
            endDate: new Date(currentYear, currentMonth, currentDate.getDate(), 13, 30),
            color: 'bg-purple-500'
        }
    ];

    // Calendar state
    let calendarDays = [];
    let weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']; // Shorter day names for compact view
    let fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // New task form
    let showNewTaskForm = false;
    let newTask = {
        title: '',
        date: formatDateForInput(new Date()),
        time: formatTimeForInput(new Date()),
        endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
        color: 'bg-pink-500'
    };

    // Available colors for tasks
    const colorOptions = [
        { value: 'bg-pink-500', label: 'Pink' },
        { value: 'bg-purple-500', label: 'Purple' },
        { value: 'bg-cyan-500', label: 'Cyan' },
        { value: 'bg-orange-500', label: 'Orange' },
        { value: 'bg-green-500', label: 'Green' },
        { value: 'bg-yellow-500', label: 'Yellow' }
    ];

    // Get week number from date
    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }

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

        // Add next month days to complete the grid
        const remainingDays = 35 - calendarDays.length; // 5 rows x 7 columns = 35 cells (more compact)
        if (remainingDays > 0) {
            for (let i = 1; i <= remainingDays; i++) {
                calendarDays.push({
                    day: i,
                    currentMonth: false,
                    date: new Date(currentYear, currentMonth + 1, i)
                });
            }
        }
    }

    // Generate days for the current week view
    function generateWeekViewDays() {
        weekViewDays = [];

        // Find the first day of the week (Sunday)
        const today = new Date(currentYear, currentMonth, currentDate.getDate());
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek);

        // Generate 7 days starting from Sunday
        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(firstDayOfWeek.getDate() + i);

            weekViewDays.push({
                day: day.getDate(),
                weekday: fullWeekdays[i],
                shortWeekday: weekdays[i],
                date: day,
                today: day.getDate() === currentDate.getDate() &&
                       day.getMonth() === currentDate.getMonth() &&
                       day.getFullYear() === currentDate.getFullYear(),
                currentMonth: day.getMonth() === currentMonth
            });
        }
    }

    // Generate time slots for week view
    function generateTimeSlots() {
        timeSlots = [];

        // Determine start and end hours based on showFullTimeRange
        const startHour = showFullTimeRange ? 0 : 4; // 4am or 12am
        const endHour = showFullTimeRange ? 24 : 22; // 10pm or 12am next day

        // Generate time slots in 5-minute increments
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 5) {
                timeSlots.push({
                    hour,
                    minute,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    isHourStart: minute === 0,
                    isHalfHour: minute === 30
                });
            }
        }
    }

    // Navigate to previous month/week
    function navigatePrevious() {
        if (viewMode === 'month') {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            generateCalendarDays();
        } else {
            // Week view - go back 7 days
            const newDate = new Date(weekViewDays[0].date);
            newDate.setDate(newDate.getDate() - 7);
            currentDate = new Date(newDate);
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            generateWeekViewDays();
        }
    }

    // Navigate to next month/week
    function navigateNext() {
        if (viewMode === 'month') {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            generateCalendarDays();
        } else {
            // Week view - go forward 7 days
            const newDate = new Date(weekViewDays[6].date);
            newDate.setDate(newDate.getDate() + 1);
            currentDate = new Date(newDate);
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            generateWeekViewDays();
        }
    }

    // Toggle between month and week view
    function toggleViewMode() {
        viewMode = viewMode === 'month' ? 'week' : 'month';
        if (viewMode === 'week') {
            generateWeekViewDays();
            generateTimeSlots();
        } else {
            generateCalendarDays();
        }
    }

    // Toggle between limited and full time range
    function toggleTimeRange() {
        showFullTimeRange = !showFullTimeRange;
        generateTimeSlots();
    }

    // Get events for a specific day
    function getEventsForDay(date) {
        return events.filter(event =>
            event.date.getDate() === date.getDate() &&
            event.date.getMonth() === date.getMonth() &&
            event.date.getFullYear() === date.getFullYear()
        );
    }

    // Check if an event should be displayed at a specific time slot
    function shouldDisplayEvent(event, day, timeSlot) {
        const eventDate = event.date;
        const eventEndDate = event.endDate;

        // Check if event is on this day
        if (eventDate.getDate() !== day.date.getDate() ||
            eventDate.getMonth() !== day.date.getMonth() ||
            eventDate.getFullYear() !== day.date.getFullYear()) {
            return false;
        }

        // Check if event starts at this time slot
        const slotTime = timeSlot.hour * 60 + timeSlot.minute;
        const eventStartTime = eventDate.getHours() * 60 + eventDate.getMinutes();

        return slotTime === eventStartTime;
    }

    // Calculate event height based on duration
    function getEventHeight(event) {
        const startTime = event.date.getHours() * 60 + event.date.getMinutes();
        const endTime = event.endDate.getHours() * 60 + event.endDate.getMinutes();
        const durationMinutes = endTime - startTime;

        // Each 5 minutes is 6px tall
        return (durationMinutes / 5) * 6;
    }

    // Start dragging an event
    function startDrag(event) {
        draggedEvent = event;
        draggedEventOriginalTime = {
            date: new Date(event.date),
            endDate: new Date(event.endDate)
        };
    }

    // Handle dropping an event on a time slot
    function dropEvent(day, timeSlot) {
        if (!draggedEvent) return;

        const originalEvent = events.find(e => e.id === draggedEvent.id);
        if (!originalEvent) return;

        // Calculate duration of the event
        const duration = (originalEvent.endDate.getTime() - originalEvent.date.getTime()) / 60000; // in minutes

        // Create new date objects for the updated event
        const newDate = new Date(day.date);
        newDate.setHours(timeSlot.hour);
        newDate.setMinutes(timeSlot.minute);

        const newEndDate = new Date(newDate);
        newEndDate.setMinutes(newDate.getMinutes() + duration);

        // Update the event
        originalEvent.date = newDate;
        originalEvent.endDate = newEndDate;

        // Reset drag state
        draggedEvent = null;
        draggedEventOriginalTime = null;

        // Trigger reactivity
        events = [...events];
    }

    // Cancel dragging and reset the event to its original time
    function cancelDrag() {
        if (!draggedEvent || !draggedEventOriginalTime) return;

        const originalEvent = events.find(e => e.id === draggedEvent.id);
        if (originalEvent) {
            originalEvent.date = draggedEventOriginalTime.date;
            originalEvent.endDate = draggedEventOriginalTime.endDate;
            events = [...events];
        }

        draggedEvent = null;
        draggedEventOriginalTime = null;
    }

    // Format time (HH:MM)
    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Format date for input field (YYYY-MM-DD)
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Format time for input field (HH:MM)
    function formatTimeForInput(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Toggle new task form
    function toggleNewTaskForm(day = null, timeSlot = null) {
        showNewTaskForm = !showNewTaskForm;
        if (showNewTaskForm) {
            // Set default date and time
            let defaultDate = new Date();
            let defaultTime = new Date();
            let defaultEndTime = new Date(defaultTime);
            defaultEndTime.setHours(defaultEndTime.getHours() + 1);

            // If day is provided, use it for the date
            if (day) {
                defaultDate = new Date(day.date);
            }

            // If timeSlot is provided, use it for the time
            if (timeSlot) {
                defaultTime = new Date(defaultDate);
                defaultTime.setHours(timeSlot.hour);
                defaultTime.setMinutes(timeSlot.minute);

                defaultEndTime = new Date(defaultTime);
                defaultEndTime.setHours(defaultEndTime.getHours() + 1);
            }

            // Reset form
            newTask = {
                title: '',
                date: formatDateForInput(defaultDate),
                time: formatTimeForInput(defaultTime),
                endTime: formatTimeForInput(defaultEndTime),
                color: 'bg-pink-500'
            };
        }
    }

    // Add new task
    function addNewTask() {
        if (newTask.title.trim() === '') {
            return; // Don't add empty tasks
        }

        // Parse date and time
        const [year, month, day] = newTask.date.split('-').map(Number);
        const [startHours, startMinutes] = newTask.time.split(':').map(Number);
        const [endHours, endMinutes] = newTask.endTime.split(':').map(Number);

        const taskDate = new Date(year, month - 1, day, startHours, startMinutes);
        const taskEndDate = new Date(year, month - 1, day, endHours, endMinutes);

        // Add new task to events array
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        events = [
            ...events,
            {
                id: newId,
                title: newTask.title,
                date: taskDate,
                endDate: taskEndDate,
                color: newTask.color
            }
        ];

        // Close form
        showNewTaskForm = false;
    }

    // Handle document click to cancel drag
    function handleDocumentClick(event) {
        // Only cancel if we're clicking outside of an event
        if (draggedEvent && !event.target.closest('.calendar-event')) {
            cancelDrag();
        }
    }

    // Initialize calendar on mount
    onMount(() => {
        generateCalendarDays();
        generateWeekViewDays();
        generateTimeSlots();

        // Add document click listener for drag cancellation
        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    });
</script>

<div class="h-full">
    <!-- Page Header -->
    <div class="mb-3 flex justify-between items-center">
        <div>
            <h1 class="text-xl font-bold text-indigo-900">Dashboard Calendar</h1>
            <p class="text-indigo-600 text-sm mt-1">
                {#if viewMode === 'month'}
                    {monthNames[currentMonth]} {currentYear}
                {:else}
                    Week of {weekViewDays[0]?.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {weekViewDays[6]?.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                {/if}
            </p>
        </div>

        <div class="flex items-center">
            <!-- View Mode Toggle -->
            <div class="flex mr-3 rounded-lg overflow-hidden shadow-sm border border-indigo-200">
                <button
                    on:click={() => { if (viewMode !== 'month') toggleViewMode(); }}
                    class="py-2 px-3 text-sm font-medium transition-colors duration-200 flex items-center {viewMode === 'month' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'}">
                    Month
                </button>
                <button
                    on:click={() => { if (viewMode !== 'week') toggleViewMode(); }}
                    class="py-2 px-3 text-sm font-medium transition-colors duration-200 flex items-center {viewMode === 'week' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'}">
                    Week
                </button>
            </div>

            <!-- Time Range Toggle (only in week view) -->
            {#if viewMode === 'week'}
                <button
                    on:click={toggleTimeRange}
                    class="bg-white hover:bg-indigo-50 text-indigo-600 font-medium py-2 px-3 rounded-lg shadow-sm border border-indigo-200 transition-colors duration-200 flex items-center text-sm mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showFullTimeRange ? '4am-10pm' : 'Full Day'}
                </button>
            {/if}

            <!-- Add Task Button -->
            <button
                on:click={() => toggleNewTaskForm()}
                class="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-full shadow-md transition-all duration-200 flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Task
            </button>
        </div>
    </div>

    <!-- New Task Form (Modal) -->
    {#if showNewTaskForm}
        <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-xl p-5 max-w-md w-full mx-4 animate-scale-in">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-indigo-900">Add New Task</h2>
                    <button
                        on:click={toggleNewTaskForm}
                        class="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form on:submit|preventDefault={addNewTask} class="space-y-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-indigo-800 mb-1">Task Title</label>
                        <input
                            type="text"
                            id="title"
                            bind:value={newTask.title}
                            class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div>
                        <label for="date" class="block text-sm font-medium text-indigo-800 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            bind:value={newTask.date}
                            class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="time" class="block text-sm font-medium text-indigo-800 mb-1">Start Time</label>
                            <input
                                type="time"
                                id="time"
                                bind:value={newTask.time}
                                class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label for="endTime" class="block text-sm font-medium text-indigo-800 mb-1">End Time</label>
                            <input
                                type="time"
                                id="endTime"
                                bind:value={newTask.endTime}
                                class="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-indigo-800 mb-1">Color</label>
                        <div class="flex space-x-2">
                            {#each colorOptions as color}
                                <button
                                    type="button"
                                    class="w-8 h-8 rounded-full {color.value} border-2 transition-all duration-200 flex items-center justify-center"
                                    class:border-white={newTask.color !== color.value}
                                    class:border-indigo-800={newTask.color === color.value}
                                    class:scale-110={newTask.color === color.value}
                                    on:click={() => newTask.color = color.value}
                                    title={color.label}
                                >
                                    {#if newTask.color === color.value}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            on:click={toggleNewTaskForm}
                            class="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200">
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors duration-200">
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Calendar Navigation -->
    <div class="flex items-center mb-2">
        <div class="flex items-center mr-4">
            <button
                on:click={navigatePrevious}
                class="p-1 hover:bg-indigo-50 rounded-full transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                on:click={navigateNext}
                class="p-1 hover:bg-indigo-50 rounded-full transition-colors duration-200 ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>

    {#if viewMode === 'month'}
        <!-- Month View Calendar Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                {#each weekdays as day}
                    <div class="p-1 text-center text-xs font-semibold">{day}</div>
                {/each}
            </div>

            <!-- Calendar Days -->
            <div class="grid grid-cols-7">
                {#each calendarDays as day, index}
                    <div
                        class="min-h-[80px] p-1 border-b border-r border-indigo-100 relative {day.currentMonth ? 'bg-white' : 'bg-gray-50/50'} {day.today ? 'ring-2 ring-pink-300 ring-inset' : ''} hover:bg-indigo-50/50 transition-colors duration-150"
                    >
                        <!-- Day Number -->
                        <div class="text-xs font-medium {day.currentMonth ? 'text-indigo-900' : 'text-gray-400'} {day.today ? 'bg-pink-100 rounded-full w-5 h-5 flex items-center justify-center' : ''}">{day.day}</div>

                        <!-- Events for this day -->
                        <div class="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
                            {#each getEventsForDay(day.date) as event}
                                <div class="text-xs p-1 rounded-lg {event.color} text-white truncate shadow-sm">
                                    <span class="font-medium">{formatTime(event.date)}</span> {event.title}
                                </div>
                            {/each}
                        </div>

                    <!-- Add task button (only visible on hover) -->
                    <button
                        class="absolute bottom-1 right-1 w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                        on:click={() => toggleNewTaskForm(day)}
                        title="Add task">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>
            {/each}
        </div>
    </div>
    {:else}
    <!-- Week View Calendar Grid -->
    <div class="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <!-- Day Headers -->
        <div class="grid grid-cols-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div class="p-2 text-center text-xs font-semibold border-r border-indigo-400">Time</div>
            {#each weekViewDays as day}
                <div class="p-2 text-center border-r border-indigo-400 last:border-r-0">
                    <div class="text-xs font-semibold">{day.shortWeekday}</div>
                    <div class="text-xs {day.today ? 'bg-pink-300 text-indigo-900 rounded-full w-5 h-5 flex items-center justify-center mx-auto' : ''}">{day.day}</div>
                </div>
            {/each}
        </div>

        <!-- Time Grid -->
        <div class="relative">
            <!-- Time Labels -->
            <div class="grid grid-cols-8" style="height: {timeSlots.length * 6}px;">
                <!-- Time column -->
                <div class="border-r border-indigo-100">
                    {#each timeSlots as slot}
                        {#if slot.isHourStart}
                            <div class="h-[72px] flex items-start justify-end pr-1 text-xs text-indigo-800 font-medium border-t border-indigo-100 pt-1">
                                {slot.hour === 0 ? '12am' : slot.hour === 12 ? '12pm' : slot.hour > 12 ? `${slot.hour - 12}pm` : `${slot.hour}am`}
                            </div>
                        {:else if slot.isHalfHour}
                            <div class="h-[6px] border-t border-indigo-50"></div>
                        {:else}
                            <div class="h-[6px]"></div>
                        {/if}
                    {/each}
                </div>

                <!-- Day columns -->
                {#each weekViewDays as day, dayIndex}
                    <div class="relative border-r border-indigo-100 last:border-r-0 {day.today ? 'bg-indigo-50/30' : ''}">
                        <!-- Time slots -->
                        {#each timeSlots as slot, slotIndex}
                            <div
                                class="h-[6px] {slot.isHourStart ? 'border-t border-indigo-100' : slot.isHalfHour ? 'border-t border-indigo-50' : ''}"
                                on:click={() => toggleNewTaskForm(day, slot)}
                                on:dragover|preventDefault
                                on:drop|preventDefault={() => dropEvent(day, slot)}
                            ></div>
                        {/each}

                        <!-- Events -->
                        {#each events as event}
                            {#each timeSlots as slot, slotIndex}
                                {#if shouldDisplayEvent(event, day, slot)}
                                    <div
                                        class="absolute calendar-event {event.color} text-white rounded-lg p-1 text-xs shadow-md overflow-hidden cursor-move"
                                        style="top: {slotIndex * 6}px; left: 2px; right: 2px; height: {getEventHeight(event)}px; z-index: 10;"
                                        draggable="true"
                                        on:dragstart={() => startDrag(event)}
                                    >
                                        <div class="font-medium">{formatTime(event.date)} - {formatTime(event.endDate)}</div>
                                        <div class="truncate">{event.title}</div>
                                    </div>
                                {/if}
                            {/each}
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>
    {/if}
</div>

<style>
    /* Animation for modal */
    @keyframes scale-in {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }

    .animate-scale-in {
        animation: scale-in 0.2s ease-out forwards;
    }
</style>
