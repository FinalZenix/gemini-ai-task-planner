<script lang="ts">
    import { onMount } from 'svelte';

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    let showFullTimeRange = false;

    let weekViewDays = [];
    let timeSlots = [];
    let draggedEvent = null;
    let draggedEventOriginalTime = null;

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

    let weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    let fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let showTaskForm = false;
    let isEditingTask = false;
    let formPosition = { x: 0, y: 0 };
    let taskFormData = {
        id: null,
        title: '',
        date: formatDateForInput(new Date()),
        time: formatTimeForInput(new Date()),
        endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
        color: 'bg-pink-500'
    };

    const colorOptions = [
        { value: 'bg-pink-500', label: 'Pink' },
        { value: 'bg-purple-500', label: 'Purple' },
        { value: 'bg-cyan-500', label: 'Cyan' },
        { value: 'bg-orange-500', label: 'Orange' },
        { value: 'bg-green-500', label: 'Green' },
        { value: 'bg-yellow-500', label: 'Yellow' }
    ];

    function generateWeekViewDays() {
        weekViewDays = [];
        const baseDate = new Date(currentDate);
        const dayOfWeek = baseDate.getDay();
        const firstDayOfWeek = new Date(baseDate);
        firstDayOfWeek.setDate(baseDate.getDate() - dayOfWeek);

        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(firstDayOfWeek.getDate() + i);
            weekViewDays.push({
                day: day.getDate(),
                weekday: fullWeekdays[i],
                shortWeekday: weekdays[i],
                date: day,
                today: day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear(),
                currentMonthDisplay: day.getMonth() === currentMonth
            });
        }
    }

    function generateTimeSlots() {
        timeSlots = [];
        const startHour = showFullTimeRange ? 0 : 4;
        const endHour = showFullTimeRange ? 24 : 22;
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

    function navigatePrevious() {
        const newDate = new Date(weekViewDays[0].date);
        newDate.setDate(newDate.getDate() - 7);
        currentDate = new Date(newDate);
        currentMonth = currentDate.getMonth();
        currentYear = currentDate.getFullYear();
        generateWeekViewDays();
    }

    function navigateNext() {
        const newDate = new Date(weekViewDays[6].date);
        newDate.setDate(newDate.getDate() + 1);
        currentDate = new Date(newDate);
        currentMonth = currentDate.getMonth();
        currentYear = currentDate.getFullYear();
        generateWeekViewDays();
    }

    function shouldDisplayEvent(event, day, timeSlot) {
        const eventDate = event.date;
        if (eventDate.getDate() !== day.date.getDate() ||
            eventDate.getMonth() !== day.date.getMonth() ||
            eventDate.getFullYear() !== day.date.getFullYear()) {
            return false;
        }
        const slotTime = timeSlot.hour * 60 + timeSlot.minute;
        const eventStartTime = eventDate.getHours() * 60 + eventDate.getMinutes();
        return slotTime === eventStartTime;
    }

    function getEventHeight(event) {
        const startTime = event.date.getHours() * 60 + event.date.getMinutes();
        const endTime = event.endDate.getHours() * 60 + event.endDate.getMinutes();
        const durationMinutes = endTime - startTime;
        return Math.max(6, (durationMinutes / 5) * 6);
    }

    function startDrag(eventData) {
        draggedEvent = eventData;
        draggedEventOriginalTime = {
            date: new Date(eventData.date),
            endDate: new Date(eventData.endDate)
        };
    }

    function dropEvent(day, timeSlot) {
        if (!draggedEvent) return;
        const originalEvent = events.find(e => e.id === draggedEvent.id);
        if (!originalEvent) return;

        const duration = (originalEvent.endDate.getTime() - originalEvent.date.getTime()) / 60000;
        const newDate = new Date(day.date);
        newDate.setHours(timeSlot.hour);
        newDate.setMinutes(timeSlot.minute);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        const newEndDate = new Date(newDate);
        newEndDate.setMinutes(newDate.getMinutes() + duration);

        originalEvent.date = newDate;
        originalEvent.endDate = newEndDate;
        draggedEvent = null;
        draggedEventOriginalTime = null;
        events = [...events];
    }

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

    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dayNum = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${dayNum}`;
    }

    function formatTimeForInput(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function _calculateFormPosition(domEvent) {
        if (domEvent) {
            formPosition = { x: domEvent.clientX, y: domEvent.clientY };
        } else {
            formPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        }
    }

    function openNewTaskForm(day = null, timeSlot = null, domEvent = null) {
        isEditingTask = false;
        _calculateFormPosition(domEvent);

        let defaultDate = new Date();
        let defaultTime = new Date();
        let defaultEndTime = new Date(defaultTime);
        defaultEndTime.setHours(defaultEndTime.getHours() + 1);

        if (day && day.date) {
            defaultDate = new Date(day.date);
        }

        if (timeSlot) {
            defaultTime = new Date(defaultDate);
            defaultTime.setHours(timeSlot.hour);
            defaultTime.setMinutes(timeSlot.minute);
            defaultEndTime = new Date(defaultTime);
            defaultEndTime.setHours(defaultEndTime.getHours() + 1);
        } else if (day && day.date) {
            defaultTime = new Date(day.date);
            defaultTime.setHours(new Date().getHours());
            defaultTime.setMinutes(new Date().getMinutes());
            defaultEndTime = new Date(defaultTime);
            defaultEndTime.setHours(defaultEndTime.getHours() + 1);
        }

        taskFormData = {
            id: null,
            title: '',
            date: formatDateForInput(defaultDate),
            time: formatTimeForInput(defaultTime),
            endTime: formatTimeForInput(defaultEndTime),
            color: 'bg-pink-500'
        };
        showTaskForm = true;
    }

    function openEditTaskForm(eventItem, domEvent) {
        isEditingTask = true;
        _calculateFormPosition(domEvent);

        taskFormData = {
            id: eventItem.id,
            title: eventItem.title,
            date: formatDateForInput(eventItem.date),
            time: formatTimeForInput(eventItem.date),
            endTime: formatTimeForInput(eventItem.endDate),
            color: eventItem.color
        };
        showTaskForm = true;
    }

    function closeTaskForm() {
        showTaskForm = false;
        taskFormData = { id: null, title: '', date: '', time: '', endTime: '', color: 'bg-pink-500' };
    }

    function handleSubmitTaskForm() {
        if (taskFormData.title.trim() === '') return;

        const [year, month, day] = taskFormData.date.split('-').map(Number);
        const [startHours, startMinutes] = taskFormData.time.split(':').map(Number);
        const [endHours, endMinutes] = taskFormData.endTime.split(':').map(Number);

        const taskDate = new Date(year, month - 1, day, startHours, startMinutes);
        const taskEndDate = new Date(year, month - 1, day, endHours, endMinutes);

        if (isEditingTask && taskFormData.id !== null) {
            const eventIndex = events.findIndex(e => e.id === taskFormData.id);
            if (eventIndex > -1) {
                events[eventIndex] = {
                    ...events[eventIndex],
                    title: taskFormData.title,
                    date: taskDate,
                    endDate: taskEndDate,
                    color: taskFormData.color
                };
                events = [...events];
            }
        } else {
            const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
            events = [...events, {
                id: newId,
                title: taskFormData.title,
                date: taskDate,
                endDate: taskEndDate,
                color: taskFormData.color
            }];
        }
        closeTaskForm();
    }

    function handleDeleteTask() {
        if (!isEditingTask || taskFormData.id === null) return;
        events = events.filter(e => e.id !== taskFormData.id);
        closeTaskForm();
    }


    function handleDocumentClick(event) {
        if (draggedEvent && !event.target.closest('.calendar-event')) {
            if (!event.target.closest('.fixed.inset-0.z-50')) {
                cancelDrag();
            }
        }
    }

    onMount(() => {
        generateWeekViewDays();
        generateTimeSlots();
        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    });
</script>

<div class="h-full flex flex-col rounded-lg text-gray-200">
    <div class="flex items-center justify-between w-full mb-3 p-3 bg-gray-800 rounded-lg shadow-md border border-gray-700/60">
        <div class="flex items-center">
            <div class="flex items-center">
                <button
                        on:click={navigatePrevious}
                        class="p-1.5 hover:bg-gray-700/80 text-teal-400 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/70"
                        aria-label="Previous week">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                        on:click={navigateNext}
                        class="p-1.5 hover:bg-gray-700/80 text-teal-400 rounded-full transition-colors duration-200 ml-1 focus:outline-none focus:ring-2 focus:ring-teal-500/70"
                        aria-label="Next week">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <p class="text-sm font-semibold text-gray-200 ml-4">
                {#if weekViewDays && weekViewDays.length > 0}
                    {weekViewDays[0]?.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {weekViewDays[6]?.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                {/if}
            </p>
        </div>
        <button
                on:click={(event) => openNewTaskForm(null, null, event)}
                class="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
        </button>
    </div>

    {#if showTaskForm}
        <div class="fixed inset-0 z-50 bg-transparent flex items-center justify-center" on:click|self={closeTaskForm}>
            <div
                    class="bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in border border-gray-600"
                    style="position: absolute; left: {Math.min(Math.max(formPosition.x - (448/2), 20), (typeof window !== 'undefined' ? window.innerWidth : 1024) - 448 - 20)}px; top: {Math.min(Math.max(formPosition.y - 200, 20), (typeof window !== 'undefined' ? window.innerHeight : 768) - 520)}px;"
                    on:click|stopPropagation>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-teal-400">{isEditingTask ? 'Edit Task' : 'Add New Task'}</h2>
                    <button
                            on:click={closeTaskForm}
                            class="text-gray-500 hover:text-gray-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form on:submit|preventDefault={handleSubmitTaskForm} class="space-y-5">
                    <div>
                        <label for="title" class="block text-sm font-medium text-teal-400/90 mb-1.5">Task Title</label>
                        <input type="text" id="title" bind:value={taskFormData.title} class="w-full px-3.5 py-2.5 bg-gray-700/70 border border-gray-600 text-gray-100 placeholder-gray-400/70 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/60 transition-colors duration-150" placeholder="Enter task title" required />
                    </div>
                    <div>
                        <label for="date" class="block text-sm font-medium text-teal-400/90 mb-1.5">Date</label>
                        <input type="date" id="date" bind:value={taskFormData.date} class="w-full px-3.5 py-2.5 bg-gray-700/70 border border-gray-600 text-gray-100 placeholder-gray-400/70 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/60 transition-colors duration-150" required />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="time" class="block text-sm font-medium text-teal-400/90 mb-1.5">Start Time</label>
                            <input type="time" id="time" bind:value={taskFormData.time} class="w-full px-3.5 py-2.5 bg-gray-700/70 border border-gray-600 text-gray-100 placeholder-gray-400/70 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/60 transition-colors duration-150" required />
                        </div>
                        <div>
                            <label for="endTime" class="block text-sm font-medium text-teal-400/90 mb-1.5">End Time</label>
                            <input type="time" id="endTime" bind:value={taskFormData.endTime} class="w-full px-3.5 py-2.5 bg-gray-700/70 border border-gray-600 text-gray-100 placeholder-gray-400/70 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/60 transition-colors duration-150" required />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-teal-400/90 mb-2">Color</label>
                        <div class="flex space-x-2">
                            {#each colorOptions as color}
                                <button type="button" class="w-8 h-8 rounded-full {color.value} border-2 transition-all duration-200 flex items-center justify-center {taskFormData.color === color.value ? 'border-teal-300 scale-110 shadow-lg' : 'border-gray-600/70 hover:border-gray-500'}" on:click={() => taskFormData.color = color.value} title={color.label}>
                                    {#if taskFormData.color === color.value}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-3">
                        {#if isEditingTask}
                            <button type="button" on:click={handleDeleteTask} class="px-4 py-2 border border-red-500/70 text-red-400/90 rounded-lg hover:bg-red-600/70 hover:text-red-100 transition-colors duration-200 mr-auto font-medium">Delete</button>
                        {/if}
                        <button type="button" on:click={closeTaskForm} class="px-4 py-2 border border-gray-600/80 text-gray-300 rounded-lg hover:bg-gray-700/70 hover:text-gray-100 transition-colors duration-200 font-medium">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg">
                            {isEditingTask ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <div class="flex-grow bg-gray-800/95 rounded-lg shadow-lg border border-gray-700/50 overflow-hidden flex flex-col min-h-0">
        <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] bg-gray-700 text-teal-400/90 sticky top-0 z-10 shadow">
            <div class="p-2.5 text-center text-xs font-semibold border-r border-gray-600/70">Time</div>
            {#each weekViewDays as day}
                <div class="p-2.5 text-center border-r border-gray-600/70 last:border-r-0">
                    <div class="text-xs font-semibold tracking-wide">{day.shortWeekday.toUpperCase()}</div>
                    <div class="text-sm font-bold mt-1 {day.today ? 'bg-teal-500 text-gray-900 rounded-full w-6 h-6 flex items-center justify-center mx-auto' : 'text-gray-300'}">{day.day}</div>
                </div>
            {/each}
        </div>

        <div class="flex-grow relative calendar overflow-y-auto min-h-0">
            <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]" style="height: {timeSlots.length * 6}px;">
                <div class="border-r border-gray-700/50">
                    {#each timeSlots as slot}
                        {#if slot.isHourStart}
                            <div class="h-[6px] flex items-start justify-end pr-1.5 text-xs text-gray-400 font-medium border-t border-gray-700/50 pt-0.5">
                                {slot.hour === 0 ? '12am' : slot.hour === 12 ? '12pm' : slot.hour > 12 ? `${slot.hour - 12}pm` : `${slot.hour}am`}
                            </div>
                        {:else if slot.isHalfHour}
                            <div class="h-[6px] border-t border-gray-600/50"></div>
                        {:else}
                            <div class="h-[6px]"></div>
                        {/if}
                    {/each}
                </div>

                {#each weekViewDays as day, dayIndex}
                    <div class="relative border-r border-gray-700/50 last:border-r-0 {day.today ? 'bg-teal-600/10' : ''}">
                        {#each timeSlots as slot, slotIndex}
                            <div
                                    class="h-[6px] {slot.isHourStart ? 'border-t border-gray-700/50' : slot.isHalfHour ? 'border-t border-gray-600/50' : ''} hover:bg-teal-500/20 cursor-pointer transition-colors duration-100"
                                    on:click={(event) => openNewTaskForm(day, slot, event)}
                                    on:dragover|preventDefault
                                    on:drop|preventDefault={() => dropEvent(day, slot)}
                            ></div>
                        {/each}

                        {#each events as eventItem}
                            {#if eventItem.date.getFullYear() === day.date.getFullYear() && eventItem.date.getMonth() === day.date.getMonth() && eventItem.date.getDate() === day.date.getDate()}
                                {#each timeSlots as slot, slotIndex}
                                    {#if shouldDisplayEvent(eventItem, day, slot)}
                                        <div
                                                class="absolute calendar-event {eventItem.color} text-white rounded-md p-1.5 text-xs shadow-lg overflow-hidden cursor-move border border-white/10"
                                                style="top: {slotIndex * 6}px; left: 4px; right: 4px; height: {getEventHeight(eventItem)}px; z-index: 10;"
                                                draggable="true"
                                                on:dragstart={() => startDrag(eventItem)}
                                                on:click={(domEvent) => { domEvent.stopPropagation(); openEditTaskForm(eventItem, domEvent); }}
                                        >
                                            <div class="font-semibold text-[11px] leading-tight mb-0.5">{formatTime(eventItem.date)} - {formatTime(eventItem.endDate)}</div>
                                            <div class="truncate text-[10px] leading-tight opacity-90">{eventItem.title}</div>
                                        </div>
                                    {/if}
                                {/each}
                            {/if}
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes scale-in {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .animate-scale-in {
        animation: scale-in 0.2s ease-out forwards;
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #1f2937;
        border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 10px;
        border: 2px solid #1f2937;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
    }

    .calendar::-webkit-scrollbar {
        display: none;
    }


    .calendar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }


    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(0.8) brightness(100%) sepia(20%) saturate(5000%) hue-rotate(130deg);
    }
</style>