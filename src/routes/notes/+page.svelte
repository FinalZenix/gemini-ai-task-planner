<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    
    interface Note {
        id: number;
        title: string;
        content: string;
        color: string;
        createdAt: string;
    }
    
    let notes: Note[] = [
        {
            id: 1,
            title: 'Project Ideas',
            content: 'Brainstorming ideas for the next project:\n- AI-powered task management\n- Real-time collaboration features\n- Mobile app integration',
            color: 'from-blue-500 to-cyan-500',
            createdAt: '2024-03-23'
        },
        {
            id: 2,
            title: 'Meeting Notes',
            content: 'Key points from the team meeting:\n1. Launch timeline discussion\n2. Resource allocation\n3. Risk assessment',
            color: 'from-purple-500 to-pink-500',
            createdAt: '2024-03-22'
        },
        {
            id: 3,
            title: 'Quick Reminders',
            content: '- Call client about project update\n- Review pull requests\n- Update documentation',
            color: 'from-orange-500 to-yellow-500',
            createdAt: '2024-03-21'
        }
    ];

    let newNote: Omit<Note, 'id' | 'createdAt'> = {
        title: '',
        content: '',
        color: 'from-blue-500 to-cyan-500'
    };

    let showNewNoteForm = false;
    let editingNoteId: number | null = null;

    const colorOptions = [
        { value: 'from-blue-500 to-cyan-500', label: 'Blue' },
        { value: 'from-purple-500 to-pink-500', label: 'Purple' },
        { value: 'from-orange-500 to-yellow-500', label: 'Orange' },
        { value: 'from-green-500 to-emerald-500', label: 'Green' }
    ];

    function addNote() {
        if (newNote.title.trim()) {
            notes = [{
                ...newNote,
                id: notes.length + 1,
                createdAt: new Date().toISOString().split('T')[0]
            }, ...notes];
            newNote = {
                title: '',
                content: '',
                color: 'from-blue-500 to-cyan-500'
            };
            showNewNoteForm = false;
        }
    }

    function editNote(note: Note) {
        newNote = { ...note };
        editingNoteId = note.id;
        showNewNoteForm = true;
    }

    function updateNote() {
        if (newNote.title.trim() && editingNoteId !== null) {
            notes = notes.map(note => 
                note.id === editingNoteId 
                    ? { ...newNote, id: note.id, createdAt: note.createdAt }
                    : note
            );
            newNote = {
                title: '',
                content: '',
                color: 'from-blue-500 to-cyan-500'
            };
            editingNoteId = null;
            showNewNoteForm = false;
        }
    }

    function deleteNote(noteId: number) {
        notes = notes.filter(note => note.id !== noteId);
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
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span>New Note</span>
            </button>
        </div>

        {#if showNewNoteForm}
            <div class="bg-gray-800 rounded-xl shadow-sm p-6 mb-6" in:fly={{ y: 20, duration: 400 }}>
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
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            placeholder="Enter note title"
                        />
                    </div>
                    <div>
                        <label for="content" class="block text-sm font-medium text-gray-300 mb-1">Content</label>
                        <textarea
                            id="content"
                            bind:value={newNote.content}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            rows="6"
                            placeholder="Enter note content"
                        ></textarea>
                    </div>
                    <div>
                        <label for="color" class="block text-sm font-medium text-gray-300 mb-1">Color Theme</label>
                        <select
                            id="color"
                            bind:value={newNote.color}
                            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
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
                            class="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                        >
                            {editingNoteId ? 'Update Note' : 'Add Note'}
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each notes as note, i}
                <div
                    class="bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md"
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
                                on:click={() => deleteNote(note.id)}
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
                        <span class="text-sm text-gray-400">Created: {note.createdAt}</span>
                        <div class="w-4 h-4 rounded-full bg-gradient-to-r {note.color}"></div>
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