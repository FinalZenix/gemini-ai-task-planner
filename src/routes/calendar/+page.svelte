<script lang="ts">
    import { onMount } from 'svelte';

    // Helper to format time (HH:MM)
    function formatTime(date: Date): string {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // --- Svelte 5 State ---
    let initialDate = new Date();
    let currentMonth = $state(initialDate.getMonth());
    let currentYear = $state(initialDate.getFullYear());
    let currentView = $state('Month'); // 'Month' or 'Week'
    let viewDropdownOpen = $state(false);
    let viewDropdownRef = $state<HTMLElement | null>(null); // Ref for dropdown
    let popoverRef = $state<HTMLElement | null>(null); // Ref for popover

    // --- Event Colors ---
    const availableColors = $state([
        { name: 'Indigo', class: 'bg-indigo-500', hoverClass: 'bg-indigo-600', textClass: 'text-indigo-50' },
        { name: 'Red', class: 'bg-red-500', hoverClass: 'bg-red-600', textClass: 'text-red-50' },
        { name: 'Green', class: 'bg-green-500', hoverClass: 'bg-green-600', textClass: 'text-green-50' },
        { name: 'Amber', class: 'bg-amber-500', hoverClass: 'bg-amber-600', textClass: 'text-amber-50' },
        { name: 'Purple', class: 'bg-purple-500', hoverClass: 'bg-purple-600', textClass: 'text-purple-50' },
        { name: 'Pink', class: 'bg-pink-500', hoverClass: 'bg-pink-600', textClass: 'text-pink-50' },
    ]);

    // --- Sample Events/Tasks Data ---
    let events = $state([
        {
            id: 1,
            title: 'Team Meeting',
            date: new Date(initialDate.getFullYear(), initialDate.getMonth(), 15, 10, 0),
            endDate: new Date(initialDate.getFullYear(), initialDate.getMonth(), 15, 11, 30),
            color: availableColors[0].class
        },
        {
            id: 2,
            title: 'Project Deadline',
            date: new Date(initialDate.getFullYear(), initialDate.getMonth(), 22, 14, 0),
            endDate: new Date(initialDate.getFullYear(), initialDate.getMonth(), 22, 15, 0),
            color: availableColors[1].class
        },
        {
            id: 3,
            title: 'Client Call',
            date: new Date(initialDate.getFullYear(), initialDate.getMonth(), 8, 9, 0),
            endDate: new Date(initialDate.getFullYear(), initialDate.getMonth(), 8, 10, 0),
            color: availableColors[2].class
        }
    ]);

    // --- Event Popover State ---
    let showEventPopover = $state(false);
    let popoverPosition = $state({ top: '0px', left: '0px' });
    let editingEvent = $state(null as {
        id?: number;
        title: string;
        eventDate: Date; // Keep the original date of the cell/event
        startTime: string;
        duration: number; // in minutes
        color: string;
        isNew: boolean;
    } | null);
    let selectedEventColor = $state(availableColors[0]);

    // --- Calendar Constants ---
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // --- Derived State for Calendar Days ---
    const calendarDays = $derived(() => {
        const daysArray: Array<{ day: number; isCurrentMonth: boolean; isToday?: boolean; date: Date }> = [];
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

        // Days from previous month
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            daysArray.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i)
            });
        }

        // Days from current month
        const today = new Date();
        for (let i = 1; i <= totalDaysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            daysArray.push({
                day: i,
                isCurrentMonth: true,
                isToday: date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(),
                date: date
            });
        }

        // Days from next month (to fill 6 rows, 42 cells total)
        const cellsSoFar = daysArray.length;
        // Ensure we always have 6 weeks (42 cells) for consistent layout
        const totalCellsTarget = 42;

        for (let i = 1; i <= totalCellsTarget - cellsSoFar; i++) {
            daysArray.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(currentYear, currentMonth + 1, i)
            });
        }
        return daysArray;
    });

    // --- Navigation Functions ---
    function prevMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        closePopover(); // Close popover if open during navigation
    }

    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        closePopover(); // Close popover if open during navigation
    }

    function goToToday() {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        closePopover(); // Close popover if open during navigation
    }

    // --- Event Handling Functions ---
    function getEventsForDay(date: Date) {
        return events.filter(event =>
            event.date.getDate() === date.getDate() &&
            event.date.getMonth() === date.getMonth() &&
            event.date.getFullYear() === date.getFullYear()
        ).sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    function handleDayClick(dayDate: Date, domEvent: MouseEvent) {
        if ((domEvent.target as HTMLElement).closest('.event-bubble')) {
            return; // Don't open for new event if clicking on an existing event
        }

        // Adjust popover position to be slightly offset from cursor
        // This prevents the cursor from obscuring the popover's edge
        const rect = (domEvent.currentTarget as HTMLElement).getBoundingClientRect();
        const clickY = domEvent.clientY - rect.top; // Y relative to cell
        const clickX = domEvent.clientX - rect.left; // X relative to cell

        // Position relative to viewport
        popoverPosition = { top: `${domEvent.clientY + 5}px`, left: `${domEvent.clientX + 5}px` };

        const now = new Date();
        editingEvent = {
            id: undefined,
            title: '',
            eventDate: dayDate,
            startTime: formatTime(now),
            duration: 60,
            color: availableColors[0].class,
            isNew: true
        };
        selectedEventColor = availableColors.find(c => c.class === editingEvent.color) || availableColors[0];
        showEventPopover = true;
    }

    function handleEventClick(eventItem, domEvent: MouseEvent) {
        domEvent.stopPropagation(); // Prevent day click which would open a new event form

        popoverPosition = { top: `${domEvent.clientY + 5}px`, left: `${domEvent.clientX + 5}px` };

        editingEvent = {
            id: eventItem.id,
            title: eventItem.title,
            eventDate: new Date(eventItem.date),
            startTime: formatTime(new Date(eventItem.date)),
            duration: (new Date(eventItem.endDate).getTime() - new Date(eventItem.date).getTime()) / 60000,
            color: eventItem.color,
            isNew: false
        };
        selectedEventColor = availableColors.find(c => c.class === editingEvent.color) || availableColors[0];
        showEventPopover = true;
    }

    function saveEvent() {
        if (!editingEvent || !editingEvent.title.trim()) {
            // Consider a more user-friendly notification than alert
            console.warn("Event title cannot be empty.");
            return;
        }

        const [hours, minutes] = editingEvent.startTime.split(':').map(Number);
        const startDate = new Date(editingEvent.eventDate);
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + editingEvent.duration * 60000);

        if (editingEvent.isNew) {
            events = [...events, {
                id: Date.now(),
                title: editingEvent.title,
                date: startDate,
                endDate: endDate,
                color: selectedEventColor.class
            }];
        } else {
            const index = events.findIndex(e => e.id === editingEvent.id);
            if (index !== -1) {
                events[index] = {
                    ...events[index],
                    title: editingEvent.title,
                    date: startDate,
                    endDate: endDate,
                    color: selectedEventColor.class
                };
                events = [...events];
            }
        }
        closePopover();
    }

    function deleteEvent() {
        if (editingEvent && !editingEvent.isNew) {
            events = events.filter(e => e.id !== editingEvent.id);
            closePopover();
        }
    }

    function closePopover() {
        showEventPopover = false;
        // editingEvent = null; // Clearing this immediately might cause issues if popover has transitions
    }

    function selectColor(color) {
        selectedEventColor = color;
        if(editingEvent) editingEvent.color = color.class;
    }

    // Effect for handling click outside for both dropdown and popover
    $effect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Dropdown
            if (viewDropdownOpen && viewDropdownRef && !viewDropdownRef.contains(event.target as Node)) {
                viewDropdownOpen = false;
            }
            // Popover
            if (showEventPopover && popoverRef && !popoverRef.contains(event.target as Node)) {
                // Check if the click is on a calendar day cell or event bubble, which might open a new popover
                const targetElement = event.target as HTMLElement;
                const isCalendarInteractiveElement = targetElement.closest('.calendar-day-cell, .event-bubble');
                if (!isCalendarInteractiveElement) {
                    closePopover();
                }
            }
        }

        if (viewDropdownOpen || showEventPopover) {
            // Add listener in capture phase to intercept clicks earlier
            document.addEventListener('click', handleClickOutside, true);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    });

</script>

<div class="p-2 sm:p-3 md:p-4 h-full flex flex-col bg-slate-50">
    <div class="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</h1>
            <p class="text-xs text-slate-500 mt-0.5">Your compact event manager</p>
        </div>

        <div class="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
            <button
                    title="Today"
                    on:click={goToToday}
                    class="p-1.5 sm:p-2 hover:bg-slate-200 text-slate-600 rounded-md transition-colors duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>
            <div class="relative" bind:this={viewDropdownRef}> {/* Bind ref for dropdown container */}
                <button
                        on:click={() => viewDropdownOpen = !viewDropdownOpen}
                        class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-md shadow-sm border border-slate-200 transition-colors duration-150 flex items-center">
                    {currentView}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {#if viewDropdownOpen}
                    <div class="origin-top-right absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div class="py-1">
                            <a href="#" on:click|preventDefault={() => { currentView = 'Month'; viewDropdownOpen = false; }} class="block px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100">Month</a>
                            <a href="#" on:click|preventDefault={() => { viewDropdownOpen = false; console.log('Week view coming soon!'); }} class="block px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100">Week <span class="text-slate-400 text-[10px]">(soon)</span></a>
                        </div>
                    </div>
                {/if}
            </div>
            <button
                    title="Previous Month"
                    on:click={prevMonth}
                    class="p-1.5 sm:p-2 hover:bg-slate-200 text-slate-600 rounded-md transition-colors duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                    title="Next Month"
                    on:click={nextMonth}
                    class="p-1.5 sm:p-2 hover:bg-slate-200 text-slate-600 rounded-md transition-colors duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>

    {#if showEventPopover && editingEvent}
        <div
                bind:this={popoverRef} class="absolute bg-white rounded-lg shadow-xl p-3 sm:p-4 w-64 sm:w-72 z-40 border border-slate-200"
                style="top: {popoverPosition.top}; left: {popoverPosition.left}; transform: translate(-10px, 10px);"
                on:click|stopPropagation> {/* Prevents click inside from closing it via the global listener */}

            <h3 class="text-md font-semibold text-slate-800 mb-3">{editingEvent.isNew ? 'Add Event' : 'Edit Event'}</h3>

            <div class="space-y-3">
                <div>
                    <label for="event-title-popover" class="block text-xs font-medium text-slate-600 mb-0.5">Title</label>
                    <input
                            type="text"
                            id="event-title-popover"
                            bind:value={editingEvent.title}
                            class="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Event title"
                    />
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label for="event-time-popover" class="block text-xs font-medium text-slate-600 mb-0.5">Time</label>
                        <input
                                type="time"
                                id="event-time-popover"
                                bind:value={editingEvent.startTime}
                                class="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label for="event-duration-popover" class="block text-xs font-medium text-slate-600 mb-0.5">Duration (min)</label>
                        <input
                                type="number"
                                id="event-duration-popover"
                                bind:value={editingEvent.duration}
                                min="15"
                                step="15"
                                class="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Color</label>
                    <div class="flex flex-wrap gap-1.5">
                        {#each availableColors as colorOption (colorOption.class)}
                            <button
                                    title={colorOption.name}
                                    on:click={() => selectColor(colorOption)}
                                    class="w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all duration-150 {colorOption.class} {colorOption.hoverClass} focus:outline-none"
                                    class:ring-2={selectedEventColor.class === colorOption.class}
                                    class:ring-offset-1={selectedEventColor.class === colorOption.class}
                                    class:ring-slate-500={selectedEventColor.class === colorOption.class}
                            >
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                {#if !editingEvent.isNew}
                    <button
                            on:click={deleteEvent}
                            class="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 font-medium">
                        Delete
                    </button>
                {:else}
                    <div></div> {/if}
                <div class="flex space-x-2">
                    <button
                            on:click={closePopover}
                            class="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-150 font-medium">
                        Cancel
                    </button>
                    <button
                            on:click={saveEvent}
                            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-md transition-colors duration-150 font-semibold">
                        {editingEvent.isNew ? 'Add Event' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-grow flex flex-col">
        <div class="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
            {#each weekdays as day}
                <div class="p-1.5 text-center text-xs font-medium text-slate-600">{day}</div>
            {/each}
        </div>

        <div class="grid grid-cols-7 grid-rows-[repeat(6,minmax(0,1fr))] flex-grow">
            {#each calendarDays as dayItem (dayItem.date.toISOString())}
                <div
                        class="calendar-day-cell min-h-[70px] sm:min-h-[80px] p-0.5 sm:p-1 border-b border-r border-slate-100 relative transition-colors duration-100
                           {dayItem.isCurrentMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'}
                           {dayItem.isToday ? 'ring-1 ring-indigo-400 ring-inset z-10' : ''}"
                        on:click={(e) => handleDayClick(dayItem.date, e)}
                >
                    <div class="text-[10px] sm:text-xs font-medium mb-0.5 flex items-center justify-center
                                {dayItem.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                                {dayItem.isToday ? 'bg-indigo-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center leading-none' : 'w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center'}">
                        {dayItem.day}
                    </div>

                    {#if dayItem.isCurrentMonth || getEventsForDay(dayItem.date).length > 0}
                        <div class="mt-0.5 space-y-0.5 overflow-y-auto max-h-[50px] sm:max-h-[60px] custom-scrollbar">
                            {#each getEventsForDay(dayItem.date) as event (event.id)}
                                <div
                                        class="event-bubble text-[9px] sm:text-[10px] px-1 py-0.5 rounded {event.color} {availableColors.find(c=>c.class === event.color)?.textClass || 'text-white'} truncate shadow-sm cursor-pointer hover:opacity-80"
                                        on:click={(e) => handleEventClick(event, e)}
                                        title="{formatTime(event.date)} - {formatTime(event.endDate)}: {event.title}"
                                >
                                    <span class="font-semibold">{formatTime(event.date)}</span> {event.title}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #cbd5e1; /* slate-300 */
        border-radius: 20px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background-color: transparent;
    }
    .grid > div:nth-child(7n) {
        border-right: none;
    }
</style>
