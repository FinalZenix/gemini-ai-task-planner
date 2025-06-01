<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/authStore';
    import {
        getNotes,
        addNote as addNoteToFirestore,
        updateNote as updateNoteInFirestore,
        deleteNote as deleteNoteFromFirestore,
        type Note
    } from '$lib/services/firestoreService';
    import { Timestamp } from 'firebase/firestore';

    let notes: Note[] = [];
    let loading = $state(true);
    let error = $state('');

    let newNote = $state({
        title: '',
        content: '',
        color: 'from-blue-500 to-cyan-500'
    });

    let showNewNoteForm = $state(false);
    let editingNoteId: string | null = $state(null);

    onMount(async () => {
        await loadNotes();
    });

    async function loadNotes() {
        try {
            loading = true;
            error = '';
            if ($user) {
                notes = await getNotes($user);
            }
        } catch (err: any) {
            error = err.message || 'Failed to load notes';
        } finally {
            loading = false;
        }
    }

    const colorOptions = [
        { value: 'from-blue-500 to-cyan-500', label: 'Blue' },
        { value: 'from-purple-500 to-pink-500', label: 'Purple' },
        { value: 'from-orange-500 to-yellow-500', label: 'Orange' },
        { value: 'from-green-500 to-emerald-500', label: 'Green' }
    ];

    async function addNote() {
        if (!newNote.title.trim() || !$user) return;

        try {
            const noteData = {
                ...newNote,
                userId: $user.uid,
                createdAt: Timestamp.now()
            };

            await addNoteToFirestore(noteData);
            await loadNotes();

            newNote = {
                title: '',
                content: '',
                color: 'from-blue-500 to-cyan-500'
            };
            showNewNoteForm = false;
        } catch (err: any) {
            error = err.message || 'Failed to add note';
        }
    }

    function editNote(note: Note) {
        if (!note.id) return;

        newNote = {
            title: note.title,
            content: note.content,
            color: note.color
        };
        editingNoteId = note.id;
        showNewNoteForm = true;
    }

    async function updateNote() {
        if (!newNote.title.trim() || !editingNoteId || !$user) return;

        try {
            await updateNoteInFirestore(editingNoteId, newNote);
            await loadNotes();

            newNote = {
                title: '',
                content: '',
                color: 'from-blue-500 to-cyan-500'
            };
            editingNoteId = null;
            showNewNoteForm = false;
        } catch (err: any) {
            error = err.message || 'Failed to update note';
        }
    }

    async function deleteNote(noteId: string) {
        if (!noteId) return;

        try {
            await deleteNoteFromFirestore(noteId);
            await loadNotes();
        } catch (err: any) {
            error = err.message || 'Failed to delete note';
        }
    }

    function cancelEdit() {
        newNote = {
            title: '',
            content: '',
            color: 'from-blue-500 to-cyan-500'
        };
        editingNoteId = null;
        showNewNoteForm = false;
    }
</script>

<div class="min-h-screen bg-gray-900 p-6" in:fade={{ duration: 300 }}>
    <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8" in:fly={{ y: 20, duration: 400 }}>
            <h1 class="text-3xl font-bold text-white">Notes</h1>
            <button
                on:click={() => showNewNoteForm = !showNewNoteForm}
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span>New Note</span>
            </button>
        </div>

        {#if error}
            <div class="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 text-sm mb-5"
                 in:fly={{ y: 10, duration: 300 }}>
                {error}
                <button
                    class="float-right text-red-300 hover:text-red-100"
                    on:click={() => error = ''}
                >
                    &times;
                </button>
            </div>
        {/if}

        {#if showNewNoteForm}
            <div class="bg-gray-800 shadow-sm p-6 mb-6" in:fly={{ y: 20, duration: 400 }}>
                <h2 class="text-xl font-semibold text-white mb-4">
                    {editingNoteId ? 'Edit Note' : 'Add New Note'}
                </h2>
                <form on:submit|preventDefault={editingNoteId ? updateNote : addNote} class="space-y-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            bind:value={newNote.title}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            placeholder="Enter note title"
                        />
                    </div>
                    <div>
                        <label for="content" class="block text-sm font-medium text-gray-300 mb-1">Content</label>
                        <textarea
                            id="content"
                            bind:value={newNote.content}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            rows="6"
                            placeholder="Enter note content"
                        ></textarea>
                    </div>
                    <div>
                        <label for="color" class="block text-sm font-medium text-gray-300 mb-1">Color Theme</label>
                        <select
                            id="color"
                            bind:value={newNote.color}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                        >
                            {#each colorOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button
                            type="button"
                            on:click={cancelEdit}
                            class="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                        >
                            {editingNoteId ? 'Update Note' : 'Add Note'}
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        {#if loading}
            <div class="flex justify-center items-center py-12">
                <div class="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        {:else if notes.length === 0}
            <div class="bg-gray-800 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-400 mb-2">No notes yet</h3>
                <p class="text-gray-500 mb-4">Create your first note to get started</p>
                <button
                    on:click={() => showNewNoteForm = true}
                    class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 inline-flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Create Note
                </button>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each notes as note, i}
                    <div
                        class="bg-gray-800 shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                        in:fly={{ y: 20, duration: 400, delay: i * 100 }}
                    >
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-medium text-white">{note.title}</h3>
                            <div class="flex space-x-2">
                                <button
                                    on:click={() => editNote(note)}
                                    class="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    on:click={() => note.id && deleteNote(note.id)}
                                    class="text-gray-500 hover:text-red-500 transition-colors duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="prose prose-sm max-w-none prose-invert">
                            {#each note.content.split('\n') as line}
                                <p class="text-gray-400">{line}</p>
                            {/each}
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span class="text-sm text-gray-400">
                                Created: {note.createdAt instanceof Timestamp
                                    ? new Date(note.createdAt.toMillis()).toLocaleDateString()
                                    : typeof note.createdAt === 'string'
                                        ? note.createdAt
                                        : new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <div class="w-4 h-4 bg-gradient-to-r {note.color}"></div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
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