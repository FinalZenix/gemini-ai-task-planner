<script lang="ts">
    import { onMount } from 'svelte';

    let currentDate = new Date();
    let currentMonth = $state(currentDate.getMonth());
    let currentYear = $state(currentDate.getFullYear());
    let selectedDate = $state<number | null>(null);
    let animatePageIn = $state(false);
    let animateMonthChange = $state(false);

    let events = $state([
        { id: 1, title: 'Team Sync', date: new Date(currentYear, currentMonth, 5), colorKey: 'blue' },
        { id: 2, title: 'Project Deadline', date: new Date(currentYear, currentMonth, 12), colorKey: 'purple' },
        { id: 3, title: 'Client Meeting', date: new Date(currentYear, currentMonth, 18), colorKey: 'green' },
        { id: 4, title: 'UX Workshop', date: new Date(currentYear, currentMonth, 25), colorKey: 'pink' },
        { id: 5, title: 'Release Prep', date: new Date(currentYear, currentMonth, 28), colorKey: 'indigo' },
    ]);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    interface EventDisplayInfo {
        bgColor: string;
        textColor: string;
    }

    function getEventDisplay(colorKey: string): EventDisplayInfo {
        const colorMap: Record<string, EventDisplayInfo> = {
            'blue': { bgColor: 'bg-sky-500/20', textColor: 'text-sky-300' },
            'purple': { bgColor: 'bg-purple-500/20', textColor: 'text-purple-300' },
            'green': { bgColor: 'bg-green-500/20', textColor: 'text-green-300' },
            'pink': { bgColor: 'bg-pink-500/20', textColor: 'text-pink-300' },
            'indigo': { bgColor: 'bg-indigo-500/20', textColor: 'text-indigo-300' },
        };
        return colorMap[colorKey] || { bgColor: 'bg-zinc-600/50', textColor: 'text-zinc-300' };
    }


    function getDaysInMonth(month: number, year: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(month: number, year: number) {
        return new Date(year, month, 1).getDay();
    }

    function generateCalendarDays() {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        const totalCells = 42;
        while (days.length < totalCells) {
            days.push(null);
        }
        return days.slice(0, totalCells);
    }

    function getEventForDay(day: number | null) {
        if (!day) return null;
        return events.find(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentMonth &&
                eventDate.getFullYear() === currentYear;
        });
    }

    function isToday(day: number | null) {
        if (!day) return false;
        const today = new Date();
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    }

    function changeMonth(offset: number) {
        let newMonth = currentMonth + offset;
        let newYear = currentYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        currentMonth = newMonth;
        currentYear = newYear;
        selectedDate = null;
        animateMonthChange = true;
        setTimeout(() => animateMonthChange = false, 400);
    }

    function handleDateSelect(day: number | null) {
        if (day === null) return;
        selectedDate = day;
    }

    onMount(() => {
        animatePageIn = true;
        setTimeout(() => animatePageIn = false, 300);
    });

    let calendarDays = $derived(generateCalendarDays());
</script>

<div class="h-full flex flex-col text-gray-300 p-4 sm:p-6 overflow-hidden">
    <div class="mb-4 text-center shrink-0">
        <h1 class="text-2xl font-semibold text-gray-100 mb-1">Month Calendar</h1>
        <p class="text-sm text-zinc-400">Your schedule at a glance.</p>
    </div>

    <div class="flex-grow flex flex-col overflow-hidden max-w-6xl w-full mx-auto">
        <div class="flex items-center justify-between mb-3 bg-zinc-800 rounded-md border border-zinc-700 p-2 sm:p-3 shrink-0">
            <button
                    on:click={() => changeMonth(-1)}
                    aria-label="Previous month"
                    class="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-100 tabular-nums tracking-wide transition-opacity duration-300" class:opacity-75={animateMonthChange}>
                {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
                    on:click={() => changeMonth(1)}
                    aria-label="Next month"
                    class="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        <div class="bg-zinc-800 rounded-md border border-zinc-700 flex flex-col flex-grow overflow-hidden shadow-lg">
            <div class="grid grid-cols-7 bg-zinc-700/40 border-b border-zinc-700 shrink-0">
                {#each dayNames as dayName}
                    <div class="py-2 px-1 text-center text-zinc-300 font-medium text-xs sm:text-sm tracking-wider">
                        {dayName.toUpperCase()}
                    </div>
                {/each}
            </div>

            <div class="flex-grow grid grid-cols-7 grid-rows-6 gap-px bg-zinc-700/30">
                {#each calendarDays as day, idx}
                    {@const eventOnDay = getEventForDay(day)}
                    <button
                            type="button"
                            class="
                            bg-zinc-800 p-1 sm:p-1.5 relative flex flex-col min-h-0 transition-colors duration-150
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-inset
                            {(day !== null) ? 'hover:bg-zinc-700/60' : ''}
                            {(day === null) ? 'cursor-default opacity-60' : ''}
                            {(selectedDate === day && day !== null) ? 'bg-zinc-700' : ''}
                            {(isToday(day) && day !== null) ? 'outline outline-2 outline-green-500 outline-offset-[-1px]' : ''}
                        "
                            class:animate-page-cell-in={animatePageIn && !animateMonthChange}
                            on:click={() => handleDateSelect(day)}
                            disabled={day === null}
                            style={animateMonthChange ? `animation: fade-in-cell 0.4s ease-out ${idx * 10}ms forwards` : (animatePageIn ? `--idx: ${idx}`: '')}
                    >
                        {#if day}
                            <div class="flex-grow flex flex-col text-left w-full h-full">
                                <div class="flex justify-between items-start">
                                     <span class="text-[0.7rem] sm:text-xs"
                                           class:font-semibold={isToday(day) || selectedDate === day}
                                           class:text-green-400={isToday(day)}
                                           class:text-gray-100={selectedDate === day && !isToday(day)}
                                           class:text-gray-300={!isToday(day) && selectedDate !== day}
                                     >
                                        {day}
                                    </span>
                                </div>
                                {#if eventOnDay}
                                    {@const display = getEventDisplay(eventOnDay.colorKey)}
                                    <div class="mt-0.5 text-[0.6rem] sm:text-[0.7rem] leading-tight overflow-hidden flex-grow mb-px">
                                        <div class="{display.bgColor} {display.textColor} px-1 sm:px-1.5 py-0.5 rounded-sm font-medium truncate text-left">
                                            {eventOnDay.title}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    {#if selectedDate}
        {@const eventForSelected = getEventForDay(selectedDate)}
        <div class="mt-3 sm:mt-4 p-3 bg-zinc-800 rounded-md border border-zinc-700 shrink-0 max-w-6xl w-full mx-auto">
            <h3 class="text-sm font-semibold text-gray-100 mb-1.5">
                Events for: {monthNames[currentMonth]} {selectedDate}, {currentYear}
            </h3>
            {#if eventForSelected}
                {@const display = getEventDisplay(eventForSelected.colorKey)}
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full {display.bgColor} border {display.textColor.replace('text-', 'border-')}/50"></div>
                    <span class="text-sm text-gray-200">{eventForSelected.title}</span>
                </div>
            {:else}
                <p class="text-sm text-zinc-400">No events scheduled for this day.</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    @keyframes fade-in-cell {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    .animate-page-cell-in {
        animation: fade-in-cell 0.3s ease-out forwards;
        animation-delay: calc(var(--idx, 0) * 15ms);
    }
</style>