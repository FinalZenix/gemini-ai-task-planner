<script lang="ts">
    import { onMount, tick } from 'svelte';

    // --- Define these constants EARLIER ---
    const weekdaysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
    const fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // --- Core State ---
    let currentDate = $state(new Date());
    let showFullTimeRange = $state(false);
    let showGoToTodayButton = $state(false);

    let weekViewDays = $state<Array<{ day: number; weekday: string; shortWeekday: string; date: Date; isToday: boolean }>>([]);
    let timeSlots = $state<Array<{ hour: number; minute: number; time: string; isHourStart: boolean; isHalfHour: boolean; isQuarterHour: boolean }>>([]);
    let draggedEvent = $state<DisplayEventSegment | null>(null);
    let draggedEventOriginalTime = $state<{ date: Date; endDate: Date; originalId: number } | null>(null);

    // --- Event Types and Default Colors ---
    const eventTypes = {
        TASK: { label: 'Task', defaultColorKey: 'pink' },
        ROUTINE: { label: 'Routine', defaultColorKey: 'purple' },
        APPOINTMENT: { label: 'Appointment', defaultColorKey: 'cyan' },
        EVENT: { label: 'Event', defaultColorKey: 'orange' },
        ALL_DAY: { label: 'All-Day', defaultColorKey: 'gray'}
    };

    // --- Event Data Structure (Updated) ---
    interface CalendarEvent {
        id: number;
        title: string;
        date: Date; // Start date and time
        endDate: Date; // End date and time
        colorKey: string; // Specific color override (e.g., 'blue', 'green')
        eventType: keyof typeof eventTypes;
        isAllDay: boolean;
        recurrence: {
            rule: 'NONE' | 'DAILY' | 'WEEKLY';
            interval?: number;
            daysOfWeek?: (typeof weekdaysMap[number])[];
            until?: Date | null;
        };
        description?: string; // Optional description
        originalId?: number; // For recurring instances
        isOccurrence?: boolean; // True if this is a generated recurring instance
    }

    function getFirstDayOfWeekOccurrence(startDate: Date, targetDayOfWeekJS: number, validDaysShort: (typeof weekdaysMap[number])[], startHour: number = 0, startMinute: number = 0): Date {
        let d = new Date(startDate);
        d.setDate(d.getDate() - d.getDay() + targetDayOfWeekJS);
        d.setHours(startHour, startMinute, 0, 0);

        let attempts = 0;
        const checkStartDate = new Date(startDate);
        checkStartDate.setHours(0,0,0,0);

        while (attempts < 52 * 7) { // Check for up to 52 weeks
            const currentDayShort = weekdaysMap[d.getDay()];
            if (d >= checkStartDate && validDaysShort.includes(currentDayShort)) {
                return d;
            }
            d.setDate(d.getDate() + 1);
            attempts++;
        }

        // Fallback if no valid day is found within the search window (should ideally not happen with proper logic)
        const fallbackDate = new Date(startDate);
        fallbackDate.setHours(startHour, startMinute, 0,0);
        return fallbackDate;
    }


    let events = $state<CalendarEvent[]>([
        {
            id: 1, title: 'Daily Standup (All Day)',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 999),
            colorKey: 'blue', eventType: 'ROUTINE', isAllDay: true,
            recurrence: { rule: 'DAILY', interval: 1, until: null }
        },
        {
            id: 2, title: 'Gym Session',
            date: getFirstDayOfWeekOccurrence(new Date(), 1, ['MO', 'WE', 'FR'], 9,0), // Example: Monday, Wednesday, Friday at 9:00 AM
            endDate: getFirstDayOfWeekOccurrence(new Date(), 1, ['MO', 'WE', 'FR'], 10,0), // Ends at 10:00 AM
            colorKey: 'orange', eventType: 'ROUTINE', isAllDay: false,
            recurrence: { rule: 'WEEKLY', interval: 1, daysOfWeek: ['MO', 'WE', 'FR'], until: null }
        },
        {
            id: 3, title: 'Client Call',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 14, 0), // 15th of current month, 2:00 PM
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 15, 0), // Ends at 3:00 PM
            colorKey: 'cyan', eventType: 'APPOINTMENT', isAllDay: false,
            recurrence: { rule: 'NONE' }
        },
        {
            id: 4, title: 'Project Alpha Due (All Day)',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 0, 0), // 20th of current month
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 23, 59, 59, 999),
            colorKey: 'red', eventType: 'TASK', isAllDay: true,
            recurrence: { rule: 'NONE' }
        },
        {
            id: 5, title: 'Team Retreat (Multi-Day All-Day)',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 0, 0), // From 10th
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 23, 59, 59, 999), // To 12th
            colorKey: 'green', eventType: 'EVENT', isAllDay: true,
            recurrence: { rule: 'NONE' }
        },
        {
            id: 6, title: 'Late Work (Crosses Midnight)',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 22, 0), // Tomorrow 10:00 PM
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 2, 0), // Day after tomorrow 2:00 AM
            colorKey: 'purple', eventType: 'TASK', isAllDay: false,
            recurrence: { rule: 'NONE' }
        }
    ]);

    // --- Date/Time Utilities ---
    function formatDateForInput(date: Date | null): string {
        if (!date) return '';
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    function formatTimeForInput(date: Date | null): string {
        if (!date) return '';
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    function formatTimeForDisplay(date: Date): string {
        if (!date) return "N/A";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // --- Calendar Grid Logic ---
    function checkIfTodayIsVisible() {
        if (!weekViewDays.length) {
            return true;
        }
        const today = new Date();
        today.setHours(0,0,0,0);
        const viewStartDate = new Date(weekViewDays[0].date);
        const viewEndDate = new Date(weekViewDays[6].date);
        viewEndDate.setHours(23,59,59,999);
        return !(today >= viewStartDate && today <= viewEndDate);
    }

    function generateWeekViewDays() {
        let newWeekViewDays = [];
        const baseDate = new Date(currentDate);
        const dayOfWeek = baseDate.getDay();
        const firstDayOfWeek = new Date(baseDate);
        firstDayOfWeek.setDate(baseDate.getDate() - dayOfWeek);
        firstDayOfWeek.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(firstDayOfWeek.getDate() + i);
            newWeekViewDays.push({
                day: day.getDate(),
                weekday: fullWeekdays[day.getDay()],
                shortWeekday: weekdaysMap[day.getDay()],
                date: day,
                isToday: day.toDateString() === new Date().toDateString(),
            });
        }
        weekViewDays = newWeekViewDays;
    }

    function generateTimeSlots() {
        let newTimeSlots = [];
        const startHour = showFullTimeRange ? 0 : 6;
        const endHour = showFullTimeRange ? 24 : 22;
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                newTimeSlots.push({
                    hour,
                    minute,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    isHourStart: minute === 0,
                    isHalfHour: minute === 30,
                    isQuarterHour: minute === 15 || minute === 45,
                });
            }
        }
        timeSlots = newTimeSlots;
    }

    const timeSlotHeight = $derived(12);

    // --- Event Processing and Display ---
    interface DisplayEventSegment extends CalendarEvent {
        segmentStartDate: Date;
        segmentEndDate: Date;
        span: number;
        offsetLeft?: number;
        isContinuation?: boolean;
        continuesNextDay?: boolean;
    }

    const displayedEvents = $derived(() => {
        if (!weekViewDays.length || !events.length) return [];
        const allSegments: DisplayEventSegment[] = [];
        const viewStart = new Date(weekViewDays[0].date);
        const viewEnd = new Date(weekViewDays[6].date);
        viewEnd.setHours(23, 59, 59, 999);

        for (const event of events) {
            const processEvent = (currentEventInstance: CalendarEvent, isOccurrence: boolean, instanceDate?: Date) => {
                const actualStartDate = instanceDate ? new Date(instanceDate) : new Date(currentEventInstance.date);
                if(isOccurrence) {
                    actualStartDate.setHours(currentEventInstance.date.getHours(), currentEventInstance.date.getMinutes(), currentEventInstance.date.getSeconds());
                }
                const durationMs = currentEventInstance.endDate.getTime() - currentEventInstance.date.getTime();
                const actualEndDate = new Date(actualStartDate.getTime() + durationMs);

                if (actualEndDate < viewStart || actualStartDate > viewEnd) return;

                for (let i = 0; i < weekViewDays.length; i++) {
                    const day = weekViewDays[i].date;
                    const dayStart = new Date(day);
                    const dayEnd = new Date(day);
                    dayEnd.setHours(23, 59, 59, 999);

                    if (actualStartDate <= dayEnd && actualEndDate >= dayStart) {
                        const segmentStartDate = actualStartDate < dayStart ? dayStart : new Date(actualStartDate);
                        const segmentEndDate = actualEndDate > dayEnd ? dayEnd : new Date(actualEndDate);
                        let span = 0;
                        if (currentEventInstance.isAllDay) {
                            let currentSpanDate = new Date(segmentStartDate);
                            while(currentSpanDate.getTime() <= segmentEndDate.getTime() &&
                            currentSpanDate.getTime() <= viewEnd.getTime() &&
                            !allSegments.some(s => s.originalId === currentEventInstance.id && s.isAllDay && s.segmentStartDate.toDateString() === currentSpanDate.toDateString())) {
                                span++;
                                currentSpanDate.setDate(currentSpanDate.getDate() + 1);
                            }
                        }
                        if (currentEventInstance.isAllDay && span === 0 && segmentStartDate.toDateString() === day.toDateString()) {
                            span = 1;
                        }

                        allSegments.push({
                            ...currentEventInstance,
                            id: isOccurrence ? `${currentEventInstance.id}_${actualStartDate.getTime()}` : currentEventInstance.id,
                            originalId: currentEventInstance.id,
                            isOccurrence,
                            date: new Date(actualStartDate),
                            endDate: new Date(actualEndDate),
                            segmentStartDate,
                            segmentEndDate,
                            span: currentEventInstance.isAllDay && span > 0 ? span : 1,
                            isContinuation: actualStartDate < dayStart,
                            continuesNextDay: actualEndDate > dayEnd,
                        });
                        if (currentEventInstance.isAllDay && span > 1) {
                            i += (span -1) ;
                        }
                    }
                }
            };

            if (!event.recurrence || event.recurrence.rule === 'NONE') {
                processEvent(event, false);
            } else {
                let currentIterationDate = new Date(event.date);
                const recurrenceUntilDate = event.recurrence.until ? new Date(event.recurrence.until) : null;
                if (recurrenceUntilDate) recurrenceUntilDate.setHours(23, 59, 59, 999);
                let iterations = 0;
                const maxIterations = 365 * 2;
                while (iterations < maxIterations && currentIterationDate <= viewEnd) {
                    iterations++;
                    if (recurrenceUntilDate && currentIterationDate > recurrenceUntilDate) break;
                    if (!recurrenceUntilDate && currentIterationDate > new Date(viewEnd.getTime() + 30 * 24 * 60 * 60 * 1000)) {
                        break;
                    }
                    let isValidInstanceDay = false;
                    if (event.recurrence.rule === 'DAILY') {
                        const daysSinceStart = Math.round((new Date(currentIterationDate).setHours(0,0,0,0) - new Date(event.date).setHours(0,0,0,0)) / (24*60*60*1000));
                        if (daysSinceStart >= 0 && daysSinceStart % (event.recurrence.interval || 1) === 0) {
                            isValidInstanceDay = true;
                        }
                    } else if (event.recurrence.rule === 'WEEKLY') {
                        const currentDayCode = weekdaysMap[currentIterationDate.getDay()];
                        if (event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.includes(currentDayCode)) {
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
                        processEvent(event, true, new Date(currentIterationDate));
                    }
                    if (event.recurrence.rule === 'DAILY') {
                        currentIterationDate.setDate(currentIterationDate.getDate() + 1);
                    } else if (event.recurrence.rule === 'WEEKLY') {
                        currentIterationDate.setDate(currentIterationDate.getDate() + 1);
                    } else {
                        break;
                    }
                }
            }
        }
        const allDayEventRows: DisplayEventSegment[][] = [];
        allSegments
            .filter(e => e.isAllDay)
            .sort((a,b) => a.segmentStartDate.getTime() - b.segmentStartDate.getTime() || (b.segmentEndDate.getTime() - b.date.getTime()) - (a.segmentEndDate.getTime() - a.date.getTime()))
            .forEach(event => {
                let placed = false;
                for (let i = 0; i < allDayEventRows.length; i++) {
                    const lastEventInRow = allDayEventRows[i][allDayEventRows[i].length - 1];
                    const endOfLastEventInRow = new Date(lastEventInRow.segmentStartDate);
                    endOfLastEventInRow.setDate(lastEventInRow.segmentStartDate.getDate() + lastEventInRow.span);
                    if (event.segmentStartDate >= endOfLastEventInRow) {
                        event.offsetLeft = i;
                        allDayEventRows[i].push(event);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    event.offsetLeft = allDayEventRows.length;
                    allDayEventRows.push([event]);
                }
            });
        return allSegments;
    });

    function getEventsForDayColumn(day: { date: Date }, allDisplayedEventSegmentsValue: DisplayEventSegment[]) {
        if (!day || !day.date || !allDisplayedEventSegmentsValue) return { timed: [], allDay: [] };
        const targetDateString = day.date.toDateString();
        const timed = allDisplayedEventSegmentsValue.filter(event =>
            !event.isAllDay &&
            new Date(event.segmentStartDate).toDateString() === targetDateString
        );
        const allDay = allDisplayedEventSegmentsValue.filter(event =>
            event.isAllDay &&
            new Date(event.segmentStartDate).toDateString() === targetDateString
        );
        return { timed, allDay };
    }

    // --- UI Interaction ---
    let dayDetailsSidebarOpen = $state(false);
    let eventsForSelectedDateInSidebar = $state<DisplayEventSegment[]>([]);
    let selectedDate = $state<number | null>(null);


    function navigatePrevious() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        if (dayDetailsSidebarOpen) {
            dayDetailsSidebarOpen = false;
            selectedDate = null;
        }
        currentDate = newDate;
    }

    function navigateNext() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        if (dayDetailsSidebarOpen) {
            dayDetailsSidebarOpen = false;
            selectedDate = null;
        }
        currentDate = newDate;
    }

    function goToToday() {
        if (dayDetailsSidebarOpen) {
            dayDetailsSidebarOpen = false;
            selectedDate = null;
        }
        currentDate = new Date();
    }

    function getEventTopPosition(eventDate: Date): number {
        if (!timeSlots.length || !eventDate) return 0;
        const eventStartTotalMinutes = eventDate.getHours() * 60 + eventDate.getMinutes();
        const firstViewableSlotTotalMinutes = (timeSlots[0]?.hour || 0) * 60 + (timeSlots[0]?.minute || 0);
        const relativeEventStartMinutes = eventStartTotalMinutes - firstViewableSlotTotalMinutes;
        return (relativeEventStartMinutes / 15) * timeSlotHeight;
    }

    function getEventHeight(event: DisplayEventSegment): number {
        const durationMinutes = (event.segmentEndDate.getTime() - event.segmentStartDate.getTime()) / 60000;
        const minHeight = timeSlotHeight / 2;
        return Math.max(minHeight, (durationMinutes / 15) * timeSlotHeight);
    }

    function startDrag(eventData: DisplayEventSegment, domEvent: DragEvent) {
        if (eventData.isAllDay) {
            domEvent.preventDefault();
            return;
        }
        draggedEvent = eventData;
        draggedEventOriginalTime = {
            date: new Date(eventData.date),
            endDate: new Date(eventData.endDate),
            originalId: eventData.originalId as number
        };
        if (domEvent.dataTransfer) {
            domEvent.dataTransfer.effectAllowed = 'move';
            domEvent.dataTransfer.setData('text/plain', (eventData.originalId || eventData.id).toString());
        }
    }

    function dropEvent(day: { date: Date }, timeSlot: { hour: number, minute: number }) {
        if (!draggedEvent || !draggedEventOriginalTime) return;
        if (draggedEvent.isAllDay) {
            draggedEvent = null;
            draggedEventOriginalTime = null;
            return;
        }

        const baseEventIndex = events.findIndex(e => e.id === draggedEventOriginalTime!.originalId);
        if (baseEventIndex === -1) {
            console.error("Base event not found for dragging.");
            draggedEvent = null;
            draggedEventOriginalTime = null;
            return;
        }
        const baseEvent = { ...events[baseEventIndex] };
        const durationMs = draggedEventOriginalTime.endDate.getTime() - draggedEventOriginalTime.date.getTime();
        const newSegmentStartDate = new Date(day.date);
        newSegmentStartDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        baseEvent.date = newSegmentStartDate;
        baseEvent.endDate = new Date(newSegmentStartDate.getTime() + durationMs);

        if (baseEvent.recurrence && baseEvent.recurrence.rule === 'WEEKLY') {
            const newDayCode = weekdaysMap[newSegmentStartDate.getDay()];
            if (baseEvent.recurrence.daysOfWeek && !baseEvent.recurrence.daysOfWeek.includes(newDayCode)) {
                baseEvent.recurrence.daysOfWeek = [newDayCode];
            } else if (!baseEvent.recurrence.daysOfWeek) {
                baseEvent.recurrence.daysOfWeek = [newDayCode];
            }
        }

        events[baseEventIndex] = baseEvent;
        events = [...events];

        draggedEvent = null;
        draggedEventOriginalTime = null;
    }

    function dropAllDayEvent(day: { date: Date }) {
        if (!draggedEvent || !draggedEventOriginalTime || draggedEvent.isAllDay) {
            if (draggedEvent && draggedEvent.isAllDay) {
                draggedEvent = null;
                draggedEventOriginalTime = null;
                return;
            }
            draggedEvent = null;
            draggedEventOriginalTime = null;
            return;
        }

        const baseEventIndex = events.findIndex(e => e.id === draggedEventOriginalTime!.originalId);
        if (baseEventIndex === -1) return;
        const baseEvent = { ...events[baseEventIndex] };
        const newStartDate = new Date(day.date);
        newStartDate.setHours(0,0,0,0);
        const originalDurationMs = draggedEventOriginalTime.endDate.getTime() - draggedEventOriginalTime.date.getTime();
        let durationDays = Math.max(1, Math.ceil(originalDurationMs / (24*60*60*1000)));
        if (originalDurationMs < (23.5 * 60 * 60 * 1000)) durationDays = 1;
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + durationDays -1);
        newEndDate.setHours(23,59,59,999);
        baseEvent.date = newStartDate;
        baseEvent.endDate = newEndDate;
        baseEvent.isAllDay = true;
        events[baseEventIndex] = baseEvent;
        events = [...events];
        draggedEvent = null;
        draggedEventOriginalTime = null;
    }

    function cancelDrag() {
        draggedEvent = null;
        draggedEventOriginalTime = null;
    }

    // --- Form State & Logic ---
    let showTaskForm = $state(false);
    let isEditingTask = $state(false);
    let editingEventOriginalId = $state<number | null>(null);

    const initialTaskFormData = {
        id: null as number | null,
        title: '',
        date: formatDateForInput(new Date()),
        time: formatTimeForInput(new Date()),
        endDate: formatDateForInput(new Date()),
        endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
        colorKey: 'pink',
        eventType: 'TASK' as keyof typeof eventTypes,
        isAllDay: false,
        recurrenceRule: 'NONE' as 'NONE' | 'DAILY' | 'WEEKLY',
        recurrenceDaysOfWeek: [] as (typeof weekdaysMap[number])[],
        recurrenceUntil: ''
    };
    let taskFormData = $state({...initialTaskFormData});

    const colorOptions = [
        { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
        { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
        { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
        { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
        { value: 'green', label: 'Green', class: 'bg-green-600' },
        { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
        { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
        { value: 'red', label: 'Red', class: 'bg-red-500' },
        { value: 'gray', label: 'Gray', class: 'bg-gray-500'}
    ];

    function getEventDisplayCssClass(eventType: keyof typeof eventTypes, overrideColorKey?: string): string {
        const typeStyle = eventTypes[eventType] || eventTypes.TASK;
        let chosenColorKey = overrideColorKey || typeStyle.defaultColorKey;
        const selectedColorOption = colorOptions.find(opt => opt.value === chosenColorKey);
        if (!selectedColorOption) {
            chosenColorKey = typeStyle.defaultColorKey;
            if (!colorOptions.find(opt => opt.value === chosenColorKey)) {
                chosenColorKey = 'gray'; // Default fallback
            }
        }
        return `event-color-${chosenColorKey}`;
    }


    function openNewTaskForm(day: { date: Date } | null = null, timeSlot: { hour: number, minute: number } | null = null, domEvent: MouseEvent | null = null) {
        isEditingTask = false;
        editingEventOriginalId = null;
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
            defaultStartTime.setHours(now.getHours() + (domEvent ? 0 : 1), domEvent ? Math.ceil(now.getMinutes()/15)*15 : 0);
        }
        let defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000);
        taskFormData = {
            ...initialTaskFormData,
            date: formatDateForInput(defaultStartTime),
            time: formatTimeForInput(defaultStartTime),
            endDate: formatDateForInput(defaultEndTime),
            endTime: formatTimeForInput(defaultEndTime),
            eventType: 'TASK',
            isAllDay: !timeSlot && !domEvent,
        };
        showTaskForm = true;
    }

    function openEditTaskForm(eventInstance: DisplayEventSegment, domEvent: MouseEvent) {
        const baseEvent = events.find(e => e.id === eventInstance.originalId);
        if (!baseEvent) {
            console.error("Cannot find base event to edit.");
            return;
        }
        isEditingTask = true;
        editingEventOriginalId = baseEvent.id;
        taskFormData = {
            id: baseEvent.id,
            title: baseEvent.title,
            date: formatDateForInput(baseEvent.date),
            time: formatTimeForInput(baseEvent.date),
            endDate: formatDateForInput(baseEvent.endDate),
            endTime: formatTimeForInput(baseEvent.endDate),
            colorKey: baseEvent.colorKey,
            eventType: baseEvent.eventType,
            isAllDay: baseEvent.isAllDay,
            recurrenceRule: baseEvent.recurrence?.rule || 'NONE',
            recurrenceDaysOfWeek: [...(baseEvent.recurrence?.daysOfWeek || [])],
            recurrenceUntil: baseEvent.recurrence?.until ? formatDateForInput(new Date(baseEvent.recurrence.until)) : ''
        };
        showTaskForm = true;
    }

    function closeTaskForm() {
        showTaskForm = false;
    }

    function handleSubmitTaskForm() {
        if (taskFormData.title.trim() === '') return;
        const [sYear, sMonth, sDay] = taskFormData.date.split('-').map(Number);
        const [sHours, sMinutes] = taskFormData.isAllDay ? [0,0] : taskFormData.time.split(':').map(Number);
        let taskStartDate = new Date(sYear, sMonth - 1, sDay, sHours, sMinutes);
        let taskEndDate: Date;
        if (taskFormData.isAllDay) {
            taskStartDate.setHours(0,0,0,0);
            const [eYear, eMonth, eDay] = taskFormData.endDate.split('-').map(Number);
            taskEndDate = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);
        } else {
            const [eHours, eMinutes] = taskFormData.endTime.split(':').map(Number);
            const [eYear, eMonth, eDay] = taskFormData.endDate.split('-').map(Number);
            taskEndDate = new Date(eYear, eMonth - 1, eDay, eHours, eMinutes);
        }
        if (taskEndDate < taskStartDate) {
            if (typeof window !== 'undefined') window.alert("End date/time cannot be before start date/time.");
            return;
        }
        let recurrenceData: CalendarEvent['recurrence'] = { rule: 'NONE' };
        if (taskFormData.recurrenceRule && taskFormData.recurrenceRule !== 'NONE') {
            recurrenceData = {
                rule: taskFormData.recurrenceRule,
                interval: 1,
                daysOfWeek: taskFormData.recurrenceRule === 'WEEKLY' ? [...taskFormData.recurrenceDaysOfWeek] : undefined,
                until: taskFormData.recurrenceUntil ? new Date(taskFormData.recurrenceUntil) : null
            };
            if (recurrenceData.until) recurrenceData.until.setHours(23, 59, 59, 999);
        }
        const eventToSave: Omit<CalendarEvent, 'id' | 'originalId' | 'isOccurrence'> = {
            title: taskFormData.title.trim(),
            date: taskStartDate,
            endDate: taskEndDate,
            colorKey: taskFormData.colorKey,
            eventType: taskFormData.eventType,
            isAllDay: taskFormData.isAllDay,
            recurrence: recurrenceData
        };
        if (isEditingTask && editingEventOriginalId !== null) {
            const eventIndex = events.findIndex(e => e.id === editingEventOriginalId);
            if (eventIndex > -1) {
                events[eventIndex] = {
                    ...events[eventIndex],
                    ...eventToSave
                };
            }
        } else {
            const newId = (events.length > 0 ? Math.max(0, ...events.map(e => e.id)) : 0) + 1;
            events.push({
                id: newId,
                ...eventToSave
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
        if (typeof window !== 'undefined' && window.confirm(confirmMessage)) {
            events = events.filter(e => e.id !== editingEventOriginalId);
            closeTaskForm();
        }
    }

    function toggleRecurrenceDay(dayShortCode: typeof weekdaysMap[number]) {
        const index = taskFormData.recurrenceDaysOfWeek.indexOf(dayShortCode);
        if (index > -1) {
            taskFormData.recurrenceDaysOfWeek.splice(index, 1);
        } else {
            taskFormData.recurrenceDaysOfWeek.push(dayShortCode);
        }
        taskFormData.recurrenceDaysOfWeek = [...taskFormData.recurrenceDaysOfWeek];
    }

    // --- Sidebar Logic ---
    function handleDateSelectForSidebar(dayNumber: number | null) {
        if (dayNumber === null) {
            dayDetailsSidebarOpen = false;
            selectedDate = null;
            return;
        }
        if (selectedDate === dayNumber && dayDetailsSidebarOpen) {
            dayDetailsSidebarOpen = false;
            return;
        }
        selectedDate = dayNumber;
        const dayObj = weekViewDays.find(d => d.day === dayNumber && d.date.getMonth() === currentDate.getMonth());
        if (dayObj) {
            const allCurrentDisplayedEvents = displayedEvents();
            const filteredEvents = allCurrentDisplayedEvents.filter(event => {
                const segStartDay = new Date(event.segmentStartDate);
                segStartDay.setHours(0,0,0,0);
                const segEndDay = new Date(event.segmentEndDate);
                segEndDay.setHours(23,59,59,999);
                return dayObj.date >= segStartDay && dayObj.date <= segEndDay;
            });
            eventsForSelectedDateInSidebar = filteredEvents;
        } else {
            eventsForSelectedDateInSidebar = [];
        }
        dayDetailsSidebarOpen = true;
    }
    function closeDayDetailsSidebar() {
        dayDetailsSidebarOpen = false;
    }

    // --- Lifecycle and Effects ---
    $effect(() => {
        showGoToTodayButton = checkIfTodayIsVisible();
    });

    onMount(() => {
        generateTimeSlots();
        generateWeekViewDays();
        const clickHandler = (event: MouseEvent) => {
            if (draggedEvent && event.target && !(event.target as HTMLElement).closest('.calendar-event, .calendar-grid-cell, .all-day-event-area')) {
                cancelDrag();
            }
        };
        const dragOverHandler = (event: DragEvent) => {
            event.preventDefault();
        };
        document.addEventListener('click', clickHandler);
        document.addEventListener('dragover', dragOverHandler);
        return () => {
            document.removeEventListener('click', clickHandler);
            document.removeEventListener('dragover', dragOverHandler);
        };
    });

    $effect(() => {
        if (currentDate) {
            generateWeekViewDays();
        }
    });

    $effect(() => {
        if (showFullTimeRange !== undefined) {
            generateTimeSlots();
        }
    });
</script>

<div class="relative h-full flex flex-col text-gray-300 rounded-lg p-4 sm:p-6 overflow-hidden bg-zinc-900 z-10">
    <div class="flex items-center justify-between w-full mb-3 p-3 bg-zinc-800 rounded-lg shadow-md border border-zinc-700 shrink-0">
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
                    {new Date(currentDate).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                {/if}
            </p>
        </div>
        <div class="flex items-center gap-3">
            <label class="flex items-center text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" bind:checked={showFullTimeRange} class="mr-1.5 h-4 w-4 rounded text-green-500 bg-zinc-700 border-zinc-600 focus:ring-green-500 focus:ring-offset-zinc-800 cursor-pointer" />
                Full Day (0-24h)
            </label>
            <button
                    on:click={(event) => openNewTaskForm(null, null, event)}
                    class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add
            </button>
        </div>
    </div>

    {#if showTaskForm}
        <div class="fixed inset-0 z-49 bg-black/60 backdrop-blur-sm" on:click={closeTaskForm} aria-hidden="true"></div>
        <aside
                class="fixed top-0 right-0 h-full bg-zinc-800 shadow-xl z-50 transition-transform duration-300 ease-in-out border-l border-zinc-700"
                style="width: 26rem;"
                class:translate-x-0={showTaskForm}
                class:translate-x-full={!showTaskForm}
                aria-labelledby="task-form-title"
        >
            <div class="flex flex-col h-full">
                <div class="flex justify-between items-center p-4 sm:p-5 h-16 border-b border-zinc-700 shrink-0">
                    <h2 id="task-form-title" class="text-lg font-semibold text-green-400">{isEditingTask ? 'Edit Entry' : 'New Calendar Entry'}</h2>
                    <button on:click={closeTaskForm} class="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form on:submit|preventDefault={handleSubmitTaskForm} class="flex-grow p-4 sm:p-5 space-y-4 overflow-y-auto" id="task-form-id">
                    <div>
                        <label for="title-input" class="block text-xs font-medium text-zinc-300 mb-1">Title</label>
                        <input type="text" id="title-input" bind:value={taskFormData.title} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 placeholder-zinc-500 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" placeholder="E.g., Meeting with team" required />
                    </div>
                    <div>
                        <label for="eventType-select" class="block text-xs font-medium text-zinc-300 mb-1">Type</label>
                        <select id="eventType-select" bind:value={taskFormData.eventType} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors">
                            {#each Object.entries(eventTypes) as [key, typeObj]}
                                <option value={key}>{typeObj.label}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex-1">
                            <label for="date-input" class="block text-xs font-medium text-zinc-300 mb-1">Start Date</label>
                            <input type="date" id="date-input" bind:value={taskFormData.date} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
                        </div>
                        {#if !taskFormData.isAllDay}
                            <div class="w-28">
                                <label for="time-input" class="block text-xs font-medium text-zinc-300 mb-1">Start Time</label>
                                <input type="time" id="time-input" bind:value={taskFormData.time} step="900" class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required={!taskFormData.isAllDay} />
                            </div>
                        {/if}
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex-1">
                            <label for="endDate-input" class="block text-xs font-medium text-zinc-300 mb-1">End Date</label>
                            <input type="date" id="endDate-input" bind:value={taskFormData.endDate} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
                        </div>
                        {#if !taskFormData.isAllDay}
                            <div class="w-28">
                                <label for="endTime-input" class="block text-xs font-medium text-zinc-300 mb-1">End Time</label>
                                <input type="time" id="endTime-input" bind:value={taskFormData.endTime} step="900" class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required={!taskFormData.isAllDay} />
                            </div>
                        {/if}
                    </div>
                    <div class="pt-1">
                        <label class="flex items-center text-sm text-zinc-300 cursor-pointer">
                            <input type="checkbox" bind:checked={taskFormData.isAllDay} class="mr-2 h-4 w-4 rounded text-green-500 bg-zinc-700 border-zinc-600 focus:ring-green-500 focus:ring-offset-zinc-800 cursor-pointer" />
                            All-day event
                        </label>
                    </div>

                    <div>
                        <label for="recurrenceRule-select" class="block text-xs font-medium text-zinc-300 mb-1">Repeats</label>
                        <select id="recurrenceRule-select" bind:value={taskFormData.recurrenceRule} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors">
                            <option value="NONE">Does not repeat</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                        </select>
                    </div>

                    {#if taskFormData.recurrenceRule === 'WEEKLY'}
                        <div class="pt-1">
                            <label class="block text-xs font-medium text-zinc-300 mb-1.5">Repeat on</label>
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
                            <label for="recurrenceUntil-date" class="block text-xs font-medium text-zinc-300 mb-1">End Date (Optional)</label>
                            <input type="date" id="recurrenceUntil-date" bind:value={taskFormData.recurrenceUntil} class="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-gray-100 text-sm rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" />
                        </div>
                    {/if}

                    <div>
                        <label class="block text-xs font-medium text-zinc-300 mb-1.5">Color</label>
                        <div class="flex flex-wrap gap-2">
                            {#each colorOptions as colorOpt (colorOpt.value)}
                                <button type="button" class="w-6 h-6 rounded-full {colorOpt.class} border-2 transition-all duration-150 flex items-center justify-center
                                    {taskFormData.colorKey === colorOpt.value ? 'border-green-400 scale-110 ring-2 ring-green-400 ring-offset-1 ring-offset-zinc-700' : 'border-transparent hover:border-zinc-500'}"
                                        on:click={() => taskFormData.colorKey = colorOpt.value} title={colorOpt.label}>
                                    {#if taskFormData.colorKey === colorOpt.value}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>
                </form>
                <div class="flex justify-end space-x-3 p-4 sm:p-5 border-t border-zinc-700/80 shrink-0">
                    {#if isEditingTask}
                        <button type="button" on:click={handleDeleteTask} class="px-4 py-2 border border-red-500/70 text-red-400 hover:bg-red-500/20 hover:border-red-500 rounded-md transition-colors duration-150 font-medium text-sm">Delete</button>
                    {/if}
                    <button type="button" on:click={closeTaskForm} class="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700 hover:text-gray-100 transition-colors duration-150 font-medium text-sm ml-auto">Cancel</button>
                    <button type="submit" form="task-form-id" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-150 font-semibold shadow-md hover:shadow-lg text-sm">
                        {isEditingTask ? 'Update Entry' : 'Add Entry'}
                    </button>
                </div>
            </div>
        </aside>
    {/if}

    <div class="flex-grow bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden flex flex-col min-h-0">
        <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] bg-zinc-700/60 text-green-400 sticky top-0 z-20 shadow-sm border-b border-zinc-700">
            <div class="p-2.5 text-center text-xs font-semibold border-r border-zinc-600/70 flex items-center justify-center text-zinc-400">Time</div>
            {#each weekViewDays as dayHeader (dayHeader.date.toDateString())}
                <div class="p-1.5 sm:p-2 text-center border-r border-zinc-600/70 last:border-r-0 cursor-pointer hover:bg-zinc-700/80 transition-colors" on:click={() => handleDateSelectForSidebar(dayHeader.day)}>
                    <div class="text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-zinc-400">{dayHeader.shortWeekday}</div>
                    <div class={`text-base sm:text-lg font-bold mt-0.5 ${dayHeader.isToday ? 'bg-green-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center mx-auto' : 'text-gray-200'}`}>{dayHeader.day}</div>
                </div>
            {/each}
        </div>

        <div class="border-b border-zinc-600/70 relative bg-zinc-700/20 py-0.5 all-day-event-area" style="min-height: {Math.max(1, (displayedEvents().filter(e=>e.isAllDay).reduce((max, e) => Math.max(max, e.offsetLeft || 0), -1) + 1)) * 26 + 4}px;">
            <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] h-full relative">
                <div class="border-r border-zinc-600/70"></div> {#each weekViewDays as day (day.date.toDateString())}
                {@const allDayEventsOnThisDay = getEventsForDayColumn(day, displayedEvents()).allDay}
                <div class="relative border-r border-zinc-600/70 last:border-r-0 p-0.5 space-y-0.5 overflow-hidden"
                     on:dragover|preventDefault
                     on:drop|preventDefault={() => dropAllDayEvent(day)}>
                    {#each allDayEventsOnThisDay as eventItem (eventItem.id)}
                        {@const eventCssClass = getEventDisplayCssClass(eventItem.eventType, eventItem.colorKey)}
                        {#if eventItem.segmentStartDate.toDateString() === day.date.toDateString() || (day.date.getDay() === 0 && eventItem.segmentStartDate < day.date && eventItem.segmentEndDate >= day.date) }
                            <div
                                    class="all-day-event rounded text-[10px] sm:text-xs px-1 py-0.5 shadow {eventItem.isAllDay ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} overflow-hidden truncate {eventCssClass}"
                                    style="width: calc({eventItem.span * 100}% - {eventItem.span > 1 ? '4px' : '2px'});
                                           margin-left: {day.date.getDay() === 0 && eventItem.segmentStartDate < day.date && eventItem.span > (7-eventItem.segmentStartDate.getDay()) ? `calc(${(day.date.getDay() - eventItem.segmentStartDate.getDay()) * -100}% - 2px)` : '1px'};
                                           margin-right: 1px;
                                           top: {(eventItem.offsetLeft || 0) * 26}px;
                                           position: {eventItem.offsetLeft !== undefined ? 'absolute' : 'relative'};
                                           z-index: {5 + (eventItem.offsetLeft || 0)};"
                                    draggable={!eventItem.isAllDay}
                                    on:dragstart={(domEvent) => startDrag(eventItem, domEvent)}
                                    on:click|stopPropagation={(domEvent) => openEditTaskForm(eventItem, domEvent)}
                                    title={eventItem.title}
                            >
                                {#if eventItem.eventType === 'TASK'}<span>📌 </span>{/if}{eventItem.title}
                            </div>
                        {/if}
                    {/each}
                </div>
            {/each}
            </div>
        </div>


        <div class="flex-grow relative calendar-grid-area overflow-y-auto min-h-0">
            <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]" style="min-height: {timeSlots.length * timeSlotHeight}px;">
                <div class="border-r border-zinc-600/70 relative">
                    {#each timeSlots as slot (slot.time)}
                        <div class="relative" style="height: {timeSlotHeight}px;">
                            {#if slot.isHourStart}
                                <div class="absolute -top-1.5 right-1.5 text-[9px] sm:text-[10px] text-zinc-400 font-medium select-none pointer-events-none">
                                    {slot.hour.toString().padStart(2, '0')}:00 </div>
                            {/if}
                        </div>
                    {/each}
                </div>

                {#each weekViewDays as day (day.date.toDateString())}
                    {@const timedEventsOnThisDay = getEventsForDayColumn(day, displayedEvents()).timed}
                    <div class="relative border-r border-zinc-600/70 last:border-r-0 calendar-grid-cell {day.isToday ? 'bg-green-600/5' : ''}"
                         on:dragover|preventDefault
                         on:drop|preventDefault={() => { /* Main drop on day column, specific slots handle drops for timed events */ }}>
                        {#each timeSlots as slot (`${day.date.toDateString()}_${slot.time}`)}
                            <div
                                    class="{slot.isHourStart ? 'border-t border-zinc-600/70' : slot.isHalfHour ? 'border-t border-zinc-700/50' : slot.isQuarterHour ? 'border-t border-zinc-700/30' : 'border-t border-transparent'} hover:bg-green-500/10 cursor-pointer transition-colors duration-100"
                                    style="height: {timeSlotHeight}px;"
                                    on:click={(event) => openNewTaskForm(day, slot, event)}
                                    on:dragover|preventDefault
                                    on:drop|preventDefault|stopPropagation={() => dropEvent(day, slot)}
                            ></div>
                        {/each}

                        {#each timedEventsOnThisDay as eventItem (eventItem.id)}
                            {@const eventCssClass = getEventDisplayCssClass(eventItem.eventType, eventItem.colorKey)}
                            {@const topPos = getEventTopPosition(eventItem.segmentStartDate)}
                            {@const height = getEventHeight(eventItem)}
                            {#if topPos !== null && height > 0 && topPos >= 0 && topPos < (timeSlots.length * timeSlotHeight) }
                                <div
                                        class="absolute calendar-event rounded p-1 text-xs shadow-lg overflow-hidden cursor-grab active:cursor-grabbing {eventCssClass}"
                                        style="top: {topPos}px; left: 3px; right: 3px; height: {height}px; z-index: 10;"
                                        draggable="true"
                                        on:dragstart={(domEvent) => startDrag(eventItem, domEvent)}
                                        on:click|stopPropagation={(domEvent) => openEditTaskForm(eventItem, domEvent)}
                                        title={`${eventItem.title} (${formatTimeForDisplay(eventItem.segmentStartDate)} - ${formatTimeForDisplay(eventItem.segmentEndDate)})`}
                                >
                                    <div class="font-semibold text-[10px] leading-tight mb-px">{eventItem.title}</div>
                                    <div class="text-[9px] leading-tight opacity-80">{formatTimeForDisplay(eventItem.segmentStartDate)} - {formatTimeForDisplay(eventItem.segmentEndDate)}</div>
                                    {#if eventItem.isContinuation}<span class="absolute -top-0.5 left-0.5 text-[8px] continuation-indicator">◣</span>{/if}
                                    {#if eventItem.continuesNextDay}<span class="absolute -bottom-0.5 right-0.5 text-[8px] continuation-indicator">◢</span>{/if}
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <aside class="fixed top-0 h-full bg-zinc-800 shadow-xl z-40 transition-transform duration-300 ease-in-out border-l border-zinc-700"
           class:translate-x-0={dayDetailsSidebarOpen}
           class:translate-x-full={!dayDetailsSidebarOpen}
           style="right: 0; width: 22rem;"
           aria-labelledby="day-details-title">
        <div class="flex flex-col h-full">
            <div class="flex items-center justify-between shrink-0 px-4 h-16 border-b border-zinc-700">
                {#if selectedDate && weekViewDays.find(d => d.day === selectedDate && d.date.getMonth() === currentDate.getMonth())}
                    {@const dayObj = weekViewDays.find(d => d.day === selectedDate && d.date.getMonth() === currentDate.getMonth())}
                    {#if dayObj}
                        <h3 id="day-details-title" class="text-lg font-semibold text-gray-100">
                            {dayObj.weekday}, {new Date(currentDate).toLocaleDateString('en-US', {month: 'long'})} {selectedDate}
                        </h3>
                    {:else}
                        <h3 id="day-details-title" class="text-lg font-semibold text-gray-100">Details</h3>
                    {/if}
                {:else}
                    <h3 id="day-details-title" class="text-lg font-semibold text-gray-100">Details</h3>
                {/if}
                <button on:click={closeDayDetailsSidebar} aria-label="Close day details" class="text-zinc-400 hover:text-gray-100 p-1 rounded-md hover:bg-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="flex-1 p-4 overflow-y-auto space-y-3">
                {#if eventsForSelectedDateInSidebar.length > 0}
                    {#each eventsForSelectedDateInSidebar as eventItem (eventItem.id)}
                        {@const eventCssClass = getEventDisplayCssClass(eventItem.eventType, eventItem.colorKey)}
                        <div class="p-3 rounded-md {eventItem.isAllDay ? 'cursor-default' : 'cursor-pointer hover:brightness-125'} transition-all {eventCssClass}"
                             on:click={(e) => openEditTaskForm(eventItem, e)}>
                            <p class="font-medium text-sm mb-0.5">{eventItem.title}</p>
                            {#if !eventItem.isAllDay}
                                <p class="text-xs opacity-80">
                                    {formatTimeForDisplay(eventItem.segmentStartDate)} - {formatTimeForDisplay(eventItem.segmentEndDate)}
                                </p>
                            {/if}
                            {#if eventItem.isAllDay}
                                <p class="text-xs opacity-80">All-day ({eventItem.segmentStartDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}{eventItem.span > 1 ? ' - ' + new Date(new Date(eventItem.segmentStartDate).setDate(eventItem.segmentStartDate.getDate() + eventItem.span -1)).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''})</p>
                            {/if}
                        </div>
                    {/each}
                {:else if selectedDate}
                    <p class="text-sm text-zinc-400 italic text-center py-4">No entries for this day.</p>
                {/if}
            </div>
            <div class="p-4 border-t border-zinc-700 shrink-0">
                {#if selectedDate}
                    {@const dayForNewEvent = weekViewDays.find(d => d.day === selectedDate && d.date.getMonth() === currentDate.getMonth())}
                    <button
                            on:click={(e) => openNewTaskForm(dayForNewEvent, null, e)}
                            class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800 focus-visible:ring-green-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add for {dayForNewEvent ? new Date(currentDate).toLocaleDateString('en-US', {month: 'short'}) + ' ' + dayForNewEvent.day : '...'}
                    </button>
                {:else}
                    <button
                            disabled
                            class="w-full flex justify-center items-center bg-zinc-600 text-zinc-400 text-sm font-semibold py-2 px-4 rounded-md cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Entry
                    </button>
                {/if}
            </div>
        </div>
    </aside>
    {#if dayDetailsSidebarOpen}
        <div class="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden" on:click={closeDayDetailsSidebar} aria-hidden="true"></div>
    {/if}

</div>

<style>
    /* Custom scrollbar styles for a more integrated dark theme look */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #52525b; }

    /* Custom checkbox styles for consistent appearance */
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
        flex-shrink: 0;
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
    input[type="checkbox"]:focus {
        outline: none;
    }
    input[type="checkbox"].focus-visible {
        outline: 2px solid #10b981;
        outline-offset: 2px;
    }

    /* Custom date/time picker indicator color for dark theme */
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(70%) sepia(10%) saturate(300%) hue-rotate(80deg) brightness(100%) contrast(90%);
        cursor: pointer;
    }
    .all-day-event {
        line-height: 1.2;
    }

    /* Event Color CSS Classes */
    .event-color-pink {
        --event-bg-color: rgba(236, 72, 153, 0.2);
        --event-text-color: rgb(244, 114, 182);
        --event-border-color: rgba(236, 72, 153, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-purple {
        --event-bg-color: rgba(168, 85, 247, 0.2);
        --event-text-color: rgb(192, 132, 252);
        --event-border-color: rgba(168, 85, 247, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-cyan {
        --event-bg-color: rgba(6, 182, 212, 0.2);
        --event-text-color: rgb(34, 211, 238);
        --event-border-color: rgba(6, 182, 212, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-orange {
        --event-bg-color: rgba(249, 115, 22, 0.2);
        --event-text-color: rgb(251, 146, 60);
        --event-border-color: rgba(249, 115, 22, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-green {
        --event-bg-color: rgba(34, 197, 94, 0.2);
        --event-text-color: rgb(74, 222, 128);
        --event-border-color: rgba(34, 197, 94, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-yellow {
        --event-bg-color: rgba(234, 179, 8, 0.2);
        --event-text-color: rgb(250, 204, 21);
        --event-border-color: rgba(234, 179, 8, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-blue {
        --event-bg-color: rgba(59, 130, 246, 0.2);
        --event-text-color: rgb(96, 165, 250);
        --event-border-color: rgba(59, 130, 246, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-red {
        --event-bg-color: rgba(239, 68, 68, 0.2);
        --event-text-color: rgb(248, 113, 113);
        --event-border-color: rgba(239, 68, 68, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }
    .event-color-gray {
        --event-bg-color: rgba(107, 114, 128, 0.2);
        --event-text-color: rgb(209, 213, 219); /* gray-300 for better contrast */
        --event-border-color: rgba(107, 114, 128, 0.4);
        background-color: var(--event-bg-color);
        color: var(--event-text-color);
        border-color: var(--event-border-color);
        border-width: 1px;
        border-style: solid;
    }

    .calendar-event .continuation-indicator {
        color: var(--event-text-color);
        opacity: 0.7;
    }
</style>
