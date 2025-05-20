<script lang="ts">
    import { goto } from '$app/navigation';
    
    // Redirect to main dashboard
    function redirectToDashboard() {
        goto('/');
    }
</script>

<div class="h-full flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold text-indigo-900 mb-4">Dashboard Subpages</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <a href="/dashboard/calendar" class="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white p-6 rounded-xl shadow-md transition-all duration-200 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 class="text-xl font-semibold mb-2">Compact Calendar</h2>
            <p class="text-sm text-white/80">View your schedule in a compact, colorful grid layout</p>
        </a>
        
        <button 
            on:click={redirectToDashboard}
            class="bg-white hover:bg-indigo-50 text-indigo-800 p-6 rounded-xl shadow-sm border border-indigo-200 transition-all duration-200 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h2 class="text-xl font-semibold mb-2 text-indigo-900">Main Dashboard</h2>
            <p class="text-sm text-indigo-600">Return to the main dashboard view</p>
        </button>
    </div>
</div>
