<script lang="ts">
    import { onMount, tick } from 'svelte'; // Added tick for potential DOM updates

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    let showFullTimeRange = false; // This will be used for toggling time view
    let showGoToTodayButton = false; // To show "Go to Today" if not on current week

    let weekViewDays = [];
    let timeSlots = [];
    let draggedEvent = null;
    let draggedEventOriginalTime = null;

    // --- Updated Event Structure with Recurrence ---
    let events = [
        {
            id: 1,
            title: 'Daily Standup',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 9, 0),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 9, 15),
            color: 'bg-blue-500',
            recurrence: {
                rule: 'DAILY', // NONE, DAILY, WEEKLY
                interval: 1,
                // daysOfWeek: undefined, // Only for WEEKLY
                until: null,
            }
        },
        {
            id: 2,
            title: 'Gym Session (MWF)',
            // Ensure base 'date' is the actual first occurrence
            date: getFirstDayOfWeekOccurrence(new Date(), 1, [1,3,5]), // First Monday for MWF
            endDate: getFirstDayOfWeekOccurrence(new Date(), 1, [1,3,5], 1), // 1 hour duration
            color: 'bg-orange-500',
            recurrence: {
                rule: 'WEEKLY',
                interval: 1,
                daysOfWeek: ['MO', 'WE', 'FR'], // SU, MO, TU, WE, TH, FR, SA (using short codes)
                until: null,
            }
        },
        {
            id: 3,
            title: 'Single Client Call',
            date: new Date(currentYear, currentMonth, 15, 14, 0),
            endDate: new Date(currentYear, currentMonth, 15, 15, 0),
            color: 'bg-cyan-500',
            recurrence: { rule: 'NONE' }
        },
    ];

    // Helper to get a date for the first occurrence of a weekly event
    function getFirstDayOfWeekOccurrence(startDate, targetDayOfWeekJS, validDaysJS = [0,1,2,3,4,5,6], durationHours = 0) {
        let d = new Date(startDate);
        // Adjust to the targetDayOfWeekJS within the week of startDate
        d.setDate(d.getDate() - d.getDay() + targetDayOfWeekJS);

        // If the calculated day is before startDate or not a valid day, advance week by week
        // This logic needs to be robust to find the *actual first valid* occurrence
        let initialD = new Date(d); // Keep a copy of the first attempt
        let attempts = 0;
        while(attempts < 52) { // Limit attempts to avoid infinite loops (e.g., 1 year)
            let currentDayIsValid = validDaysJS.includes(d.getDay());
            // If d is before startDate, or if it's the same day but we want the *next* occurrence if not valid
            if (d < startDate && !(d.toDateString() === startDate.toDateString() && currentDayIsValid)) {
                d.setDate(d.getDate() + 7); // Try next week
                attempts++;
                continue;
            }
            if (currentDayIsValid) break; // Found a valid day on or after startDate

            d.setDate(d.getDate() + 1); // Check next day
            // If we wrapped around the week without finding it, use the initial calculated day if it was valid, or advance a week
            if (d.getDay() === initialD.getDay() && d > initialD) {
                if (!validDaysJS.includes(d.getDay())) { // If the initial target day isn't valid for this rule
                    d.setDate(d.getDate() + (7 - d.getDay() + validDaysJS[0])); // Go to first valid day of next week
                }
            }
            attempts++;
        }


        if (durationHours > 0) {
            let endDate = new Date(d);
            // Set time from original startDate if not specified, or use a default (e.g., 00:00)
            endDate.setHours(startDate.getHours(), startDate.getMinutes());
            endDate.setHours(endDate.getHours() + durationHours);
            // Also set the time for 'd'
            d.setHours(startDate.getHours(), startDate.getMinutes());
            return endDate;
        }
        d.setHours(startDate.getHours(), startDate.getMinutes()); // Ensure time part is set
        return d;
    }


    const weekdaysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']; // For recurrence.daysOfWeek
    const fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let showTaskForm = false;
    let isEditingTask = false;
    let editingEventOriginalId = null; // Store the ID of the base event being edited
    let formPosition = { x: 0, y: 0 };

    // --- Updated taskFormData with Recurrence Fields ---
    let taskFormData = {
        id: null, // This will hold the original event ID if editing
        title: '',
        date: formatDateForInput(new Date()),
        time: formatTimeForInput(new Date()),
        endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
        color: 'bg-pink-500',
        recurrenceRule: 'NONE', // 'NONE', 'DAILY', 'WEEKLY'
        recurrenceDaysOfWeek: [], // Array of short weekday codes e.g., ['MO', 'WE']
        recurrenceUntil: '' // Date string YYYY-MM-DD
    };

    const colorOptions = [
        { value: 'bg-pink-500', label: 'Pink' }, { value: 'bg-purple-500', label: 'Purple' },
        { value: 'bg-cyan-500', label: 'Cyan' }, { value: 'bg-orange-500', label: 'Orange' },
        { value: 'bg-green-600', label: 'Green Event' }, { value: 'bg-yellow-500', label: 'Yellow' },
        { value: 'bg-blue-500', label: 'Blue' }, { value: 'bg-red-500', label: 'Red' }
    ];

    function updateCurrentDateVars() {
        currentMonth = currentDate.getMonth();
        currentYear = currentDate.getFullYear();
        checkIfTodayIsVisible();
    }

    function checkIfTodayIsVisible() {
        if (!weekViewDays.length) {
            showGoToTodayButton = true;
            return;
        }
        const today = new Date();
        const viewStartDate = new Date(weekViewDays[0].date);
        viewStartDate.setHours(0,0,0,0);
        const viewEndDate = new Date(weekViewDays[6].date);
        viewEndDate.setHours(23,59,59,999);
        showGoToTodayButton = !(today >= viewStartDate && today <= viewEndDate);
    }

    function generateWeekViewDays() {
        let newWeekViewDays = [];
        const baseDate = new Date(currentDate);
        const dayOfWeek = baseDate.getDay(); // 0 (Sun) - 6 (Sat)
        const firstDayOfWeek = new Date(baseDate);
        firstDayOfWeek.setDate(baseDate.getDate() - dayOfWeek);
        firstDayOfWeek.setHours(0,0,0,0);

        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(firstDayOfWeek.getDate() + i);
            newWeekViewDays.push({
                day: day.getDate(),
                weekday: fullWeekdays[i],
                shortWeekday: weekdaysMap[i], // Use consistent weekdaysMap
                date: day, // This date object will have time 00:00:00
                isToday: day.toDateString() === new Date().toDateString(),
            });
        }
        weekViewDays = newWeekViewDays;
        checkIfTodayIsVisible();
    }

    function generateTimeSlots() {
        let newTimeSlots = [];
        const startHour = showFullTimeRange ? 0 : 6;
        const endHour = showFullTimeRange ? 24 : 22;
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 5) { // 5-minute grid
                newTimeSlots.push({
                    hour,
                    minute,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    isHourStart: minute === 0,
                    isHalfHour: minute === 30
                });
            }
        }
        timeSlots = newTimeSlots;
    }

    // --- Reactive calculation for displayed events (instances) ---
    $: displayedEvents = (() => {
        if (!weekViewDays.length) return [];

        const allOccurrences = [];
        const viewStartDate = new Date(weekViewDays[0].date);
        const viewEndDate = new Date(weekViewDays[6].date);
        viewEndDate.setHours(23, 59, 59, 999);

        for (const event of events) {
            if (!event.recurrence || event.recurrence.rule === 'NONE') {
                if (event.date <= viewEndDate && event.endDate >= viewStartDate) {
                    allOccurrences.push({ ...event, originalId: event.id, isOccurrence: false });
                }
            } else {
                let currentIterationDate = new Date(event.date);
                const recurrenceUntilDate = event.recurrence.until ? new Date(event.recurrence.until) : null;
                if (recurrenceUntilDate) recurrenceUntilDate.setHours(23,59,59,999);

                let iterations = 0;
                const maxIterations = 365 * 2;

                while (iterations < maxIterations) {
                    iterations++;
                    if (recurrenceUntilDate && currentIterationDate > recurrenceUntilDate) break;

                    // Optimization: if currentIterationDate is already way past the view and there's no end date, break
                    if (!recurrenceUntilDate && currentIterationDate > new Date(viewEndDate.getTime() + 14 * 24 * 60 * 60 * 1000) ) break;


                    let isValidInstanceDay = false;
                    if (event.recurrence.rule === 'DAILY') {
                        const daysSinceStart = Math.round((new Date(currentIterationDate).setHours(0,0,0,0) - new Date(event.date).setHours(0,0,0,0)) / (24*60*60*1000));
                        if (daysSinceStart >= 0 && daysSinceStart % (event.recurrence.interval || 1) === 0) {
                            isValidInstanceDay = true;
                        }
                    } else if (event.recurrence.rule === 'WEEKLY') {
                        const currentDayCode = weekdaysMap[currentIterationDate.getDay()];
                        if (event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.includes(currentDayCode)) {
                            // For weekly interval, we need to ensure it's the correct week
                            const firstEventDateWeekStart = new Date(event.date);
                            firstEventDateWeekStart.setDate(firstEventDateWeekStart.getDate() - firstEventDateWeekStart.getDay());
                            firstEventDateWeekStart.setHours(0,0,0,0);

                            const currentIterationDateWeekStart = new Date(currentIterationDate);
                            currentIterationDateWeekStart.setDate(currentIterationDateWeekStart.getDate() - currentIterationDateWeekStart.getDay());
                            currentIterationDateWeekStart.setHours(0,0,0,0);

                            const weeksDiff = Math.round((currentIterationDateWeekStart.getTime() - firstEventDateWeekStart.getTime()) / (7*24*60*60*1000));

                            if (weeksDiff >= 0 && weeksDiff % (event.recurrence.interval || 1) === 0) {
                                isValidInstanceDay = true;
                            }
                        }
                    }

                    if (isValidInstanceDay) {
                        const durationMs = event.endDate.getTime() - event.date.getTime();
                        const occurrenceDate = new Date(currentIterationDate);
                        occurrenceDate.setHours(event.date.getHours(), event.date.getMinutes(), event.date.getSeconds());

                        const occurrenceEndDate = new Date(occurrenceDate.getTime() + durationMs);

                        if (occurrenceDate <= viewEndDate && occurrenceEndDate >= viewStartDate) {
                            allOccurrences.push({
                                ...event,
                                id: `${event.id}_${occurrenceDate.getTime()}`,
                                date: occurrenceDate,
                                endDate: occurrenceEndDate,
                                originalId: event.id,
                                isOccurrence: true
                            });
                        }
                    }

                    currentIterationDate.setDate(currentIterationDate.getDate() + 1);
                }
            }
        }
        return allOccurrences;
    })();

    function getEventsForDay(day, allDisplayedEvents) {
        if (!day || !day.date || !Array.isArray(allDisplayedEvents)) return [];
        const targetDateString = day.date.toDateString();
        return allDisplayedEvents.filter(event => {
            if (!event || !event.date) return false;
            return new Date(event.date).toDateString() === targetDateString;
        });
    }


    function navigatePrevious() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        currentDate = newDate;
        updateCurrentDateVars();
        generateWeekViewDays();
    }

    function navigateNext() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        currentDate = newDate;
        updateCurrentDateVars();
        generateWeekViewDays();
    }

    function goToToday() {
        currentDate = new Date();
        updateCurrentDateVars();
        generateWeekViewDays();
    }


    function getEventTopPosition(eventDate) {
        if (!timeSlots.length || !eventDate) return 0;
        const eventStartTotalMinutes = eventDate.getHours() * 60 + eventDate.getMinutes();
        const firstViewableSlotTotalMinutes = (timeSlots[0]?.hour || 0) * 60 + (timeSlots[0]?.minute || 0);
        const relativeEventStartMinutes = eventStartTotalMinutes - firstViewableSlotTotalMinutes;
        return (relativeEventStartMinutes / 5) * 6;
    }


    function getEventHeight(event) {
        const durationMinutes = (event.endDate.getTime() - event.date.getTime()) / 60000;
        return Math.max(6, (durationMinutes / 5) * 6);
    }

    function startDrag(eventData, domEvent) {
        draggedEvent = eventData;
        draggedEventOriginalTime = {
            date: new Date(eventData.date),
            endDate: new Date(eventData.endDate),
            originalId: eventData.originalId
        };
        domEvent.dataTransfer.effectAllowed = 'move';
        domEvent.dataTransfer.setData('text/plain', eventData.id.toString());
    }

    function dropEvent(day, timeSlot) {
        if (!draggedEvent || !draggedEventOriginalTime) return;

        const baseEvent = events.find(e => e.id === draggedEventOriginalTime.originalId);
        if (!baseEvent) return;

        const durationMs = draggedEventOriginalTime.endDate.getTime() - draggedEventOriginalTime.date.getTime();

        const newDateAtSlot = new Date(day.date);
        newDateAtSlot.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

        const newEndDateAtSlot = new Date(newDateAtSlot.getTime() + durationMs);

        if (baseEvent.recurrence && baseEvent.recurrence.rule !== 'NONE') {
            const newBaseStartDate = new Date(day.date);
            newBaseStartDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
            const baseDuration = baseEvent.endDate.getTime() - baseEvent.date.getTime();

            baseEvent.date = newBaseStartDate;
            baseEvent.endDate = new Date(newBaseStartDate.getTime() + baseDuration);

            if(baseEvent.recurrence.rule === 'WEEKLY') {
                const newDayCode = weekdaysMap[newBaseStartDate.getDay()];
                if (baseEvent.recurrence.daysOfWeek && !baseEvent.recurrence.daysOfWeek.includes(newDayCode)) {
                    baseEvent.recurrence.daysOfWeek = [newDayCode];
                }
            }

        } else {
            baseEvent.date = newDateAtSlot;
            baseEvent.endDate = newEndDateAtSlot;
        }

        events = [...events];
        draggedEvent = null;
        draggedEventOriginalTime = null;
    }

    function cancelDrag() {
        draggedEvent = null;
        draggedEventOriginalTime = null;
    }

    function formatTimeForDisplay(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    function formatDateForInput(date) {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dayNum = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${dayNum}`;
    }

    function formatTimeForInput(date) {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function _calculateFormPosition(domEvent) {
        formPosition = { x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 300 };
        if (formPosition.y < 20) formPosition.y = 20;
    }

    function openNewTaskForm(day = null, timeSlot = null, domEvent = null) {
        isEditingTask = false;
        editingEventOriginalId = null;
        _calculateFormPosition(domEvent);

        let defaultDate = new Date();
        let defaultStartTime = new Date();
        if (day?.date) {
            defaultDate = new Date(day.date);
            defaultStartTime = new Date(day.date);
        }

        if (timeSlot) {
            defaultStartTime.setHours(timeSlot.hour, timeSlot.minute);
        } else {
            const now = new Date();
            defaultStartTime.setHours(now.getHours(), Math.ceil(now.getMinutes()/30)*30);
        }

        let defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000);

        taskFormData = {
            id: null,
            title: '',
            date: formatDateForInput(defaultStartTime),
            time: formatTimeForInput(defaultStartTime),
            endTime: formatTimeForInput(defaultEndTime),
            color: 'bg-pink-500',
            recurrenceRule: 'NONE',
            recurrenceDaysOfWeek: [],
            recurrenceUntil: ''
        };
        showTaskForm = true;
    }

    function openEditTaskForm(eventInstance, domEvent) {
        const baseEvent = events.find(e => e.id === eventInstance.originalId);
        if (!baseEvent) return;

        isEditingTask = true;
        editingEventOriginalId = baseEvent.id;
        _calculateFormPosition(domEvent);

        taskFormData = {
            id: baseEvent.id,
            title: baseEvent.title,
            date: formatDateForInput(baseEvent.date),
            time: formatTimeForInput(baseEvent.date),
            endTime: formatTimeForInput(baseEvent.endDate),
            color: baseEvent.color,
            recurrenceRule: baseEvent.recurrence?.rule || 'NONE',
            recurrenceDaysOfWeek: [...(baseEvent.recurrence?.daysOfWeek || [])],
            recurrenceUntil: baseEvent.recurrence?.until ? formatDateForInput(new Date(baseEvent.recurrence.until)) : ''
        };
        showTaskForm = true;
    }

    function closeTaskForm() {
        showTaskForm = false;
        taskFormData = {
            id: null, title: '', date: formatDateForInput(new Date()),
            time: formatTimeForInput(new Date()),
            endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
            color: 'bg-pink-500', recurrenceRule: 'NONE', recurrenceDaysOfWeek: [], recurrenceUntil: ''
        };
    }

    function handleSubmitTaskForm() {
        if (taskFormData.title.trim() === '') return;

        const [year, month, dayNum] = taskFormData.date.split('-').map(Number);
        const [startHours, startMinutes] = taskFormData.time.split(':').map(Number);
        const [endHours, endMinutes] = taskFormData.endTime.split(':').map(Number);

        const taskDate = new Date(year, month - 1, dayNum, startHours, startMinutes);
        const taskEndDate = new Date(year, month - 1, dayNum, endHours, endMinutes);

        let recurrenceData = null;
        if (taskFormData.recurrenceRule && taskFormData.recurrenceRule !== 'NONE') {
            recurrenceData = {
                rule: taskFormData.recurrenceRule,
                interval: 1,
                daysOfWeek: taskFormData.recurrenceRule === 'WEEKLY' ? [...taskFormData.recurrenceDaysOfWeek] : undefined,
                until: taskFormData.recurrenceUntil ? new Date(taskFormData.recurrenceUntil) : null
            };
            if (recurrenceData.until) recurrenceData.until.setHours(23,59,59,999);
        } else {
            recurrenceData = { rule: 'NONE' };
        }


        if (isEditingTask && editingEventOriginalId !== null) {
            const eventIndex = events.findIndex(e => e.id === editingEventOriginalId);
            if (eventIndex > -1) {
                events[eventIndex] = {
                    ...events[eventIndex],
                    title: taskFormData.title,
                    date: taskDate,
                    endDate: taskEndDate,
                    color: taskFormData.color,
                    recurrence: recurrenceData
                };
            }
        } else {
            const newId = (events.length > 0 ? Math.max(...events.map(e => e.id)) : 0) + 1;
            events.push({
                id: newId,
                title: taskFormData.title,
                date: taskDate,
                endDate: taskEndDate,
                color: taskFormData.color,
                recurrence: recurrenceData
            });
        }
        events = [...events];
        closeTaskForm();
    }

    function handleDeleteTask() {
        if (!isEditingTask || editingEventOriginalId === null) return;

        const eventToDelete = events.find(e => e.id === editingEventOriginalId);
        let confirmMessage = "Are you sure you want to delete this event?";
        if (eventToDelete?.recurrence && eventToDelete.recurrence.rule !== 'NONE') {
            confirmMessage = "This is a recurring event. Deleting it will remove all its occurrences. Are you sure?";
        }

        if (confirm(confirmMessage)) {
            events = events.filter(e => e.id !== editingEventOriginalId);
            closeTaskForm();
        }
    }

    function toggleRecurrenceDay(dayShortCode) {
        const index = taskFormData.recurrenceDaysOfWeek.indexOf(dayShortCode);
        if (index > -1) {
            taskFormData.recurrenceDaysOfWeek.splice(index, 1);
        } else {
            taskFormData.recurrenceDaysOfWeek.push(dayShortCode);
        }
        taskFormData.recurrenceDaysOfWeek = [...taskFormData.recurrenceDaysOfWeek];
    }


    function handleDocumentClick(event) {
        if (draggedEvent && event.target && !event.target.closest('.calendar-event, .calendar-grid-cell')) {
            cancelDrag();
        }
    }

    function handleDocumentDragOver(event) {
        event.preventDefault();
    }


    onMount(() => {
        updateCurrentDateVars();
        generateWeekViewDays();
        generateTimeSlots();
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('dragover', handleDocumentDragOver);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('dragover', handleDocumentDragOver);
        };
    });
</script>

<div class="h-full flex flex-col text-gray-300 rounded-lg">
    <div class="flex items-center justify-between w-full mb-3 p-3 bg-zinc-800 rounded-lg shadow-md border border-zinc-700">
        <div class="flex items-center gap-2">
            {#if showGoToTodayButton}
                <button
                        on:click={goToToday}
                        class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-gray-200 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-label="Go to Today">
                    Today
                </button>
            {/if}
            <button
                    on:click={navigatePrevious}
                    class="p-1.5 hover:bg-zinc-700 text-green-500 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Previous week">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                    on:click={navigateNext}
                    class="p-1.5 hover:bg-zinc-700 text-green-500 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Next week">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <p class="text-sm font-semibold text-gray-100 ml-2">
                {#if weekViewDays && weekViewDays.length > 0 && weekViewDays[0]?.date}
                    {weekViewDays[0]?.date.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                {/if}
            </p>
        </div>
        <div class="flex items-center gap-3">
            <label class="flex items-center text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" bind:checked={showFullTimeRange} on:change={generateTimeSlots} class="mr-1.5 h-4 w-4 rounded text-green-500 bg-zinc-700 border-zinc-600 focus:ring-green-500 focus:ring-offset-zinc-800 cursor-pointer" />
                Full Day (0-24h)
            </label>
            <button
                    on:click={(event) => openNewTaskForm(null, null, event)}
                    class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add Task
            </button>
        </div>
    </div>

    {#if showTaskForm}
        <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" on:click|self={closeTaskForm}>
            <div
                    class="bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-lg animate-scale-in border border-zinc-700 max-h-[90vh] overflow-y-auto"
                    style="position: fixed; left: {formPosition.x}px; top: {formPosition.y}px;"
                    on:click|stopPropagation>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-semibold text-green-400">{isEditingTask ? 'Edit Task' : 'Add New Task'}</h2>
                    <button on:click={closeTaskForm} class="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form on:submit|preventDefault={handleSubmitTaskForm} class="space-y-4">
                    <div>
                        <label for="title-input" class="block text-sm font-medium text-zinc-300 mb-1">Task Title</label>
                        <input type="text" id="title-input" bind:value={taskFormData.title} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 placeholder-zinc-500 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" placeholder="Enter task title" required />
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label for="date-input" class="block text-sm font-medium text-zinc-300 mb-1">Date</label>
                            <input type="date" id="date-input" bind:value={taskFormData.date} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 placeholder-zinc-500 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" required />
                        </div>
                        <div>
                            <label for="time-input" class="block text-sm font-medium text-zinc-300 mb-1">Start Time</label>
                            <input type="time" id="time-input" bind:value={taskFormData.time} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 placeholder-zinc-500 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" required />
                        </div>
                        <div>
                            <label for="endTime-input" class="block text-sm font-medium text-zinc-300 mb-1">End Time</label>
                            <input type="time" id="endTime-input" bind:value={taskFormData.endTime} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 placeholder-zinc-500 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" required />
                        </div>
                    </div>

                    <div>
                        <label for="recurrenceRule-select" class="block text-sm font-medium text-zinc-300 mb-1">Repeats</label>
                        <select id="recurrenceRule-select" bind:value={taskFormData.recurrenceRule} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors">
                            <option value="NONE">Does not repeat</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                        </select>
                    </div>

                    {#if taskFormData.recurrenceRule === 'WEEKLY'}
                        <div class="pt-1">
                            <label class="block text-sm font-medium text-zinc-300 mb-1.5">Repeat on</label>
                            <div class="flex flex-wrap gap-1.5">
                                {#each weekdaysMap as dayCode, index (dayCode)}
                                    <button type="button"
                                            on:click={() => toggleRecurrenceDay(dayCode)}
                                            class="px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors
                                                   {taskFormData.recurrenceDaysOfWeek.includes(dayCode) ? 'bg-green-500 text-white border-green-500' : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300 border-zinc-500'}">
                                        {fullWeekdays[index]}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if taskFormData.recurrenceRule !== 'NONE'}
                        <div>
                            <label for="recurrenceUntil-date" class="block text-sm font-medium text-zinc-300 mb-1">End Date (Optional)</label>
                            <input type="date" id="recurrenceUntil-date" bind:value={taskFormData.recurrenceUntil} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 placeholder-zinc-500 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" />
                        </div>
                    {/if}

                    <div>
                        <label class="block text-sm font-medium text-zinc-300 mb-1.5">Color</label>
                        <div class="flex flex-wrap gap-2">
                            {#each colorOptions as color (color.value)}
                                <button type="button" class="w-7 h-7 rounded-full {color.value} border-2 transition-all duration-150 flex items-center justify-center {taskFormData.color === color.value ? 'border-green-400 scale-110 ring-2 ring-green-400 ring-offset-2 ring-offset-zinc-800' : 'border-zinc-600 hover:border-zinc-500'}" on:click={() => taskFormData.color = color.value} title={color.label}>
                                    {#if taskFormData.color === color.value}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        {#if isEditingTask}
                            <button type="button" on:click={handleDeleteTask} class="px-4 py-2 border border-red-500/80 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors duration-150 font-medium text-sm">Delete</button>
                        {/if}
                        <button type="button" on:click={closeTaskForm} class="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700 hover:text-gray-100 transition-colors duration-150 font-medium text-sm ml-auto">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-150 font-semibold shadow-md hover:shadow-lg text-sm">
                            {isEditingTask ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <div class="flex-grow bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden flex flex-col min-h-0">
        <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] bg-zinc-700 text-green-400 sticky top-0 z-20 shadow-sm">
            <div class="p-2.5 text-center text-xs font-semibold border-r border-zinc-600 flex items-center justify-center">Time</div>
            {#each weekViewDays as dayHeader (dayHeader.date.toDateString())}
                <div class="p-2 text-center border-r border-zinc-600 last:border-r-0">
                    <div class="text-xs font-semibold tracking-wide uppercase text-zinc-400">{dayHeader.shortWeekday}</div>
                    <div class={`text-lg font-bold mt-0.5 ${dayHeader.isToday ? 'bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto' : 'text-gray-200'}`}>{dayHeader.day}</div>
                </div>
            {/each}
        </div>

        <div class="flex-grow relative calendar-grid-area overflow-y-auto min-h-0">
            <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]" style="min-height: {timeSlots.length * 6}px;">
                <div class="border-r border-zinc-600 relative">
                    {#each timeSlots as slot (slot.time)}
                        <div class="h-[6px] relative">
                            {#if slot.isHourStart}
                                <div class="absolute -top-1.5 right-1.5 text-[10px] text-zinc-400 font-medium select-none">
                                    {slot.hour === 0 ? '12am' : slot.hour === 12 ? '12pm' : slot.hour > 12 ? `${slot.hour - 12}pm` : `${slot.hour}am`}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>

                {#each weekViewDays as day (day.date.toDateString())}
                    {@const eventsToDisplayOnThisDay = getEventsForDay(day, displayedEvents)}
                    <div class="relative border-r border-zinc-600 last:border-r-0 calendar-grid-cell {day.isToday ? 'bg-green-500/5' : ''}"
                         on:dragover|preventDefault
                         on:drop|preventDefault={() => { /* Main drop on day column, slots handle specific drops */ }}>
                        {#each timeSlots as slot (`${day.date.toDateString()}_${slot.time}`)}
                            <div
                                    class="h-[6px] {slot.isHourStart ? 'border-t border-zinc-600' : slot.isHalfHour ? 'border-t border-zinc-700/70' : 'border-t border-transparent'} hover:bg-green-500/15 cursor-pointer transition-colors duration-100"
                                    on:click={(event) => openNewTaskForm(day, slot, event)}
                                    on:dragover|preventDefault
                                    on:drop|preventDefault|stopPropagation={() => dropEvent(day, slot)}
                            ></div>
                        {/each}

                        {#each eventsToDisplayOnThisDay as eventItem (eventItem.id)}
                            {@const topPos = getEventTopPosition(eventItem.date)}
                            {@const height = getEventHeight(eventItem)}
                            {#if topPos !== null && height > 0 && topPos >= 0 && topPos < (timeSlots.length * 6) }
                                <div
                                        class="absolute calendar-event {eventItem.color} text-white rounded p-1 text-xs shadow-lg overflow-hidden cursor-grab border border-black/20 active:cursor-grabbing"
                                        style="top: {topPos}px; left: 4px; right: 4px; height: {height}px; z-index: 10;"
                                        draggable="true"
                                        on:dragstart={(domEvent) => startDrag(eventItem, domEvent)}
                                        on:click|stopPropagation={(domEvent) => openEditTaskForm(eventItem, domEvent)}
                                >
                                    <div class="font-semibold text-[10px] leading-tight mb-0.5">{formatTimeForDisplay(eventItem.date)} - {formatTimeForDisplay(eventItem.endDate)}</div>
                                    <div class="truncate text-[9px] leading-tight opacity-90">{eventItem.title}</div>
                                </div>
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
        0% { transform: scale(0.95) translateY(10px); opacity: 0; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
    }
    .animate-scale-in {
        animation: scale-in 0.15s ease-out forwards;
    }

    ::-webkit-scrollbar {
        width: 6px; height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    ::-webkit-scrollbar-thumb {
        background: #3f3f46;
        border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #52525b;
    }
    .calendar-grid-area::-webkit-scrollbar {
        /* display: none; */
    }
    .calendar-grid-area {
        /* -ms-overflow-style: none;
        scrollbar-width: none; */
    }
    input[type="checkbox"]{
        appearance: none;
        background-color: #3f3f46;
        border: 1px solid #52525b;
        padding: 0;
        display: inline-block;
        position: relative;
        vertical-align: middle;
        width: 1em;
        height: 1em;
    }
    input[type="checkbox"]:checked {
        background-color: #10b981;
        border-color: #059669;
    }
    input[type="checkbox"]:checked::before {
        content: "✔";
        font-size: 0.75em;
        color: white;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        line-height: 1;
    }

    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(60%) sepia(100%) saturate(300%) hue-rotate(100deg) brightness(100%) contrast(100%);
        cursor: pointer;
    }
</style>
