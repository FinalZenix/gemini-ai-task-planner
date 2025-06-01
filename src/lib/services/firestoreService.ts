import { db } from '$lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    getDoc
} from 'firebase/firestore';
import type { User } from 'firebase/auth';


// Task interface
export interface Task {
    id?: string;
    title: string;
    description?: string;
    dueDate?: Date | Timestamp;
    completed: boolean;
    progress?: number;
    priority?: 'Low' | 'Medium' | 'High';
    category?: string;
    status?: string;
    userId: string;
    createdAt: Date | Timestamp;
}

// Note interface
export interface Note {
    id?: string;
    title: string;
    content: string;
    color: string;
    userId: string;
    createdAt: Date | Timestamp;
}

// Calendar event interface
export interface CalendarEvent {
    id?: string;
    title: string;
    description?: string;
    date: Date | Timestamp; // Start date and time
    endDate: Date | Timestamp; // End date and time
    colorKey: string; // Specific color override (e.g., 'blue', 'green')
    eventType: string; // Type of event (e.g., 'TASK', 'ROUTINE', 'APPOINTMENT', 'EVENT', 'ALL_DAY')
    isAllDay: boolean;
    recurrence?: {
        rule: 'NONE' | 'DAILY' | 'WEEKLY';
        interval?: number;
        daysOfWeek?: string[];
        until?: Date | Timestamp | null;
    };
    userId: string;
    createdAt: Date | Timestamp;
}

// Tasks CRUD operations
export async function getTasks(user: User) {
    try {
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(tasksQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Task[];
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
}

export async function addTask(task: Omit<Task, 'id'>) {
    try {
        const docRef = await addDoc(collection(db, 'tasks'), {
            ...task,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...task };
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
}

export async function updateTask(taskId: string, taskData: Partial<Task>) {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, taskData);
        return true;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

export async function deleteTask(taskId: string) {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

// Notes CRUD operations
export async function getNotes(user: User) {
    try {
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(notesQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Note[];
    } catch (error) {
        console.error('Error getting notes:', error);
        return [];
    }
}

export async function addNote(note: Omit<Note, 'id'>) {
    try {
        const docRef = await addDoc(collection(db, 'notes'), {
            ...note,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...note };
    } catch (error) {
        console.error('Error adding note:', error);
        throw error;
    }
}

export async function updateNote(noteId: string, noteData: Partial<Note>) {
    try {
        const noteRef = doc(db, 'notes', noteId);
        await updateDoc(noteRef, noteData);
        return true;
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
}

export async function deleteNote(noteId: string) {
    try {
        const noteRef = doc(db, 'notes', noteId);
        await deleteDoc(noteRef);
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
}

// Calendar events CRUD operations
export async function getCalendarEvents(user: User, startDate?: Date, endDate?: Date) {
    try {
        let eventsQuery;

        if (startDate && endDate) {
            // If date range is provided, query events within that range
            // This is a simplified query - in a real app, you'd need more complex logic
            // to handle recurring events and events that span multiple days
            eventsQuery = query(
                collection(db, 'events'),
                where('userId', '==', user.uid),
                orderBy('date', 'asc')
            );
        } else {
            // Otherwise, get all events for the user
            eventsQuery = query(
                collection(db, 'events'),
                where('userId', '==', user.uid),
                orderBy('date', 'asc')
            );
        }

        const querySnapshot = await getDocs(eventsQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CalendarEvent[];
    } catch (error) {
        console.error('Error getting calendar events:', error);
        return [];
    }
}

export async function addCalendarEvent(event: Omit<CalendarEvent, 'id'>) {
    try {
        const docRef = await addDoc(collection(db, 'events'), {
            ...event,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...event };
    } catch (error) {
        console.error('Error adding calendar event:', error);
        throw error;
    }
}

export async function updateCalendarEvent(eventId: string, eventData: Partial<CalendarEvent>) {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, eventData);
        return true;
    } catch (error) {
        console.error('Error updating calendar event:', error);
        throw error;
    }
}

export async function deleteCalendarEvent(eventId: string) {
    try {
        const eventRef = doc(db, 'events', eventId);
        await deleteDoc(eventRef);
        return true;
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
    }
}
