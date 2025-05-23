<script lang="ts">
    import '../app.css'; // Ensure this path is correct
    import { page } from '$app/stores';
    import { goto } from '$app/navigation'; // Import goto for programmatic navigation

    let { children } = $props();
    let sidebarOpen = $state(true); // Left sidebar
    let dashboardDropdownOpen = $state(false);
    let aiPlannerSidebarOpen = $state(false); // Right sidebar for AI Planner

    // Use SvelteKit's $page store for active route logic
    let currentPath = $derived($page.url.pathname);

    let isCalendarPathActive = $derived(currentPath.startsWith('/calendar'));
    let isDashboardPathActive = $derived(currentPath.startsWith('/dashboard'));
    let settingsIsActive = $derived(currentPath === '/settings');

    // Removed Dashboard and AI Planner from mainNavItems
    const mainNavItems = [
        { href: '/tasks', label: 'Tasks', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />', activePaths: ['/tasks'] },
        { href: '/inbox', label: 'Inbox', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.863-11.186a2.25 2.25 0 011.183 1.98l-6.478 3.488m-1.183-1.981l-6.478-3.488a2.25 2.25 0 01-1.183-1.98V5.25A2.25 2.25 0 014.5 3h15a2.25 2.25 0 012.25 2.25z" />', activePaths: ['/inbox'] }
    ];

    const dashboardSubItems = [
        { href: '/dashboard/calendar', label: 'Compact Calendar', activePaths: ['/dashboard/calendar'] },
        { href: '/dashboard/stats', label: 'Statistics', activePaths: ['/dashboard/stats'] },
        { href: '/dashboard/reports', label: 'Reports', activePaths: ['/dashboard/reports'] },
    ];

    function toggleLeftSidebar() {
        sidebarOpen = !sidebarOpen;
        if (!sidebarOpen) {
            dashboardDropdownOpen = false; // Close dashboard dropdown if left sidebar closes
        }
        // If AI planner sidebar is open, and user explicitly opens left, maybe close AI planner? Optional.
        // if (sidebarOpen && aiPlannerSidebarOpen) {
        //     aiPlannerSidebarOpen = false;
        // }
    }

    function handleDashboardNavigationAndToggle() {
        if (!currentPath.startsWith('/dashboard')) {
            goto('/dashboard');
        }
        // Toggle dashboard dropdown logic
        if (!sidebarOpen) { // If left sidebar is closed
            sidebarOpen = true; // Open it
            // Ensure AI planner is closed if we are opening dashboard through a closed left sidebar
            if (aiPlannerSidebarOpen) aiPlannerSidebarOpen = false;
            setTimeout(() => { dashboardDropdownOpen = !dashboardDropdownOpen; }, 200); // Then open dropdown
        } else { // If left sidebar is open
            // If AI planner is open, close it as we are focusing on dashboard
            if (aiPlannerSidebarOpen) aiPlannerSidebarOpen = false;
            dashboardDropdownOpen = !dashboardDropdownOpen; // Just toggle dropdown
        }
    }

    function toggleAiPlannerSidebar() {
        aiPlannerSidebarOpen = !aiPlannerSidebarOpen;
        if (aiPlannerSidebarOpen) {
            sidebarOpen = false; // Minimize left sidebar
            dashboardDropdownOpen = false; // Close dashboard dropdown
        }
    }

    // Generate breadcrumb segments from current path
    let breadcrumbs = $derived(generateBreadcrumbs(currentPath));

    function generateBreadcrumbs(path: string) {
        if (!path || path === '/') return [{ label: 'Dashboard', path: '/' }]; // Default to Dashboard

        const segments = path.split('/').filter(Boolean);
        let result = [{ label: 'AuraPlan', path: '/' }]; // Root breadcrumb

        let currentPathSegment = '';
        segments.forEach((segment) => {
            currentPathSegment += `/${segment}`;
            const formattedSegment = segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            result.push({ label: formattedSegment, path: currentPathSegment });
        });
        return result;
    }

</script>

<div class="h-screen w-full bg-zinc-900 text-gray-300 flex अंतialised relative">
    <aside
            class="relative flex flex-col h-full bg-zinc-800 shadow-xl transition-all duration-300 ease-in-out shrink-0 z-30"
            class:w-60={sidebarOpen}
            class:w-18={!sidebarOpen}
    >
        <div class="flex items-center shrink-0 px-4 h-16 border-b border-zinc-700" class:justify-center={!sidebarOpen}>
            <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center text-white font-bold text-xl shrink-0">
                A
            </div>
            {#if sidebarOpen}
                <span
                        class="ml-2.5 text-lg font-semibold text-gray-100 whitespace-nowrap transition-opacity duration-200 ease-in-out"
                        class:opacity-100={sidebarOpen}
                        class:opacity-0={!sidebarOpen}
                        class:delay-150={sidebarOpen}
                >
                    AuraPlan
                </span>
            {/if}
        </div>

        <nav class="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
            <ul>
                <li class="relative">
                    <button
                            on:click={handleDashboardNavigationAndToggle}
                            class="w-full group flex items-center justify-between py-2.5 rounded-md transition-colors duration-150
                               {isDashboardPathActive ? 'text-white' : 'text-zinc-400 hover:text-gray-100 hover:bg-zinc-700'}
                               {isDashboardPathActive && sidebarOpen ? 'bg-zinc-700' : ''}
                               {sidebarOpen ? 'px-2 justify-start' : 'justify-center'}"
                            title="Dashboard">
                        <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" class:mr-3={sidebarOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v16.5h16.5M3.75 12h16.5m-16.5 5.25H12M5.25 5.25h5.25m-5.25 0V3" />
                            </svg>
                            {#if sidebarOpen}
                                <span class="text-sm font-medium whitespace-nowrap transition-opacity duration-200 ease-in-out" class:opacity-100={sidebarOpen} class:opacity-0={!sidebarOpen} class:delay-150={sidebarOpen}>Dashboard</span>
                            {/if}
                        </div>
                        {#if sidebarOpen}
                            <svg class="w-4 h-4 shrink-0 transform transition-transform duration-200" class:rotate-180={dashboardDropdownOpen && sidebarOpen} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        {/if}
                    </button>
                    {#if !sidebarOpen}
                        <span class="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2 py-1 w-auto min-w-max rounded-md shadow-md text-xs font-bold text-white bg-zinc-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100 z-50 pointer-events-none whitespace-nowrap">
                            Dashboard
                        </span>
                    {/if}
                    {#if sidebarOpen && dashboardDropdownOpen}
                        <div class="overflow-hidden transition-all duration-300 ease-in-out" style="max-height: {dashboardDropdownOpen && sidebarOpen ? '500px' : '0px'};">
                            <ul class="pt-1 pl-5 space-y-0.5">
                                {#each dashboardSubItems as subItem}
                                    {@const isSubActive = subItem.activePaths.includes(currentPath)}
                                    <li>
                                        <a href={subItem.href}
                                           class="block px-2 py-1.5 text-sm rounded-md transition-colors duration-150
                                              {isSubActive ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-gray-100 hover:bg-zinc-700/70'}"
                                        >
                                            {subItem.label}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </li>

                {#each mainNavItems as item}
                    {@const isActive = item.activePaths.includes(currentPath)}
                    <li>
                        <a href={item.href}
                           class="relative group flex items-center py-2.5 rounded-md transition-colors duration-150
                                  {isActive ? 'text-white' : 'text-zinc-400 hover:text-gray-100 hover:bg-zinc-700'}
                                  {isActive && sidebarOpen ? 'bg-zinc-700' : ''}
                                  {sidebarOpen ? 'px-2 justify-start' : 'justify-center'}"
                           title={item.label}>
                            {#if isActive && sidebarOpen}
                                <span class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-green-500 rounded-r-full"></span>
                            {/if}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" class:mr-3={sidebarOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                {@html item.icon}
                            </svg>
                            {#if sidebarOpen}
                                <span class="text-sm font-medium whitespace-nowrap transition-opacity duration-200 ease-in-out" class:opacity-100={sidebarOpen} class:opacity-0={!sidebarOpen} class:delay-150={sidebarOpen}>{item.label}</span>
                            {/if}
                            {#if !sidebarOpen}
                                <span class="absolute left-full ml-2.5 px-2 py-1 w-auto min-w-max rounded-md shadow-md text-xs font-bold text-white bg-zinc-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100 z-50 pointer-events-none whitespace-nowrap">
                                    {item.label}
                                </span>
                            {/if}
                        </a>
                    </li>
                {/each}

                <li>
                    <a href="/calendar"
                       class="relative group flex items-center py-2.5 rounded-md transition-colors duration-150
                              {isCalendarPathActive ? 'text-white' : 'text-zinc-400 hover:text-gray-100 hover:bg-zinc-700'}
                              {isCalendarPathActive && sidebarOpen ? 'bg-zinc-700' : ''}
                              {sidebarOpen ? 'px-2 justify-start' : 'justify-center'}"
                       title="Calendar">
                        {#if isCalendarPathActive && sidebarOpen}
                            <span class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-green-500 rounded-r-full"></span>
                        {/if}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" class:mr-3={sidebarOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {#if sidebarOpen}
                            <span class="text-sm font-medium whitespace-nowrap transition-opacity duration-200 ease-in-out" class:opacity-100={sidebarOpen} class:opacity-0={!sidebarOpen} class:delay-150={sidebarOpen}>Calendar</span>
                        {/if}
                        {#if !sidebarOpen}
                            <span class="absolute left-full ml-2.5 px-2 py-1 w-auto min-w-max rounded-md shadow-md text-xs font-bold text-white bg-zinc-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100 z-50 pointer-events-none whitespace-nowrap">
                                Calendar
                            </span>
                        {/if}
                    </a>
                </li>
            </ul>
        </nav>

        <div class="px-2.5 py-2 mt-2" class:pb-0={!sidebarOpen}>
            {#if sidebarOpen}
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <input type="search" placeholder="Search tasks, events..." class="w-full bg-zinc-700/60 border-zinc-600 placeholder-zinc-500 text-gray-200 text-sm rounded-md py-2 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all"/>
                </div>
            {/if}
        </div>

        <div class="mt-auto shrink-0 border-t border-zinc-700 p-2.5">
            <div class="space-y-2">
                <a href="/settings"
                   class="relative group flex items-center py-2 rounded-md transition-colors duration-150
                          {settingsIsActive ? 'text-white' : 'text-zinc-400 hover:text-gray-100 hover:bg-zinc-700'}
                          {settingsIsActive && sidebarOpen ? 'bg-zinc-700' : ''}
                          {sidebarOpen ? 'px-2 justify-start' : 'justify-center'}"
                   title="Settings">
                    {#if settingsIsActive && sidebarOpen}
                        <span class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-green-500 rounded-r-full"></span>
                    {/if}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" class:mr-3={sidebarOpen} fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {#if sidebarOpen}
                        <span class="text-sm font-medium whitespace-nowrap transition-opacity duration-200 ease-in-out" class:opacity-100={sidebarOpen} class:opacity-0={!sidebarOpen} class:delay-150={sidebarOpen}>Settings</span>
                    {/if}
                    {#if !sidebarOpen}
                         <span class="absolute left-full ml-2.5 px-2 py-1 w-auto min-w-max rounded-md shadow-md text-xs font-bold text-white bg-zinc-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100 z-50 pointer-events-none whitespace-nowrap">
                            Settings
                        </span>
                    {/if}
                </a>

                <button
                        on:click={toggleLeftSidebar}
                        class="w-full py-2 bg-zinc-700/40 rounded-md shadow-sm hover:bg-zinc-700/70 transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-opacity-75"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400 group-hover:text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        {#if sidebarOpen}
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                        {:else}
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        {/if}
                    </svg>
                </button>
            </div>
        </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 bg-zinc-800 border-b border-zinc-700 shrink-0 flex items-center justify-between px-4 sm:px-6 z-20">
            <div class="flex items-center">
                <div class="text-sm">
                    {#each breadcrumbs as crumb, i}
                        {#if i < breadcrumbs.length - 1}
                            <a href={crumb.path} class="text-zinc-500 hover:text-zinc-300 transition-colors">{crumb.label}</a>
                            <span class="text-zinc-500 mx-1.5">/</span>
                        {:else}
                            <span class="text-gray-100 font-medium">{crumb.label}</span>
                        {/if}
                    {/each}
                </div>
            </div>
            <div class="flex items-center space-x-3 sm:space-x-4">
                <button
                        on:click={toggleAiPlannerSidebar}
                        aria-label="AI Planner"
                        title="AI Planner"
                        class="p-1.5 text-zinc-400 hover:text-gray-100 hover:bg-zinc-700 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m1.5 0V5.25A2.25 2.25 0 017.5 3h5.25a2.25 2.25 0 012.25 2.25V18L9.75 12.75M8.25 3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                <span class="text-xs text-zinc-400 hidden sm:inline">AI Status: Idle</span>
                <span class="px-2.5 py-1 text-xs font-medium text-green-300 bg-green-600/30 rounded-full flex items-center">
                    <svg class="w-2 h-2 text-green-300 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                    </svg>
                    Online
                </span>
                <button aria-label="Notifications" class="p-1.5 text-zinc-400 hover:text-gray-100 hover:bg-zinc-700 rounded-full">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                </button>
                <img class="w-8 h-8 rounded-full object-cover border-2 border-zinc-700" src="https://via.placeholder.com/100" alt="User Avatar"/>
            </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-0 bg-zinc-900">
            {@render children()}
        </main>
    </div>

    <aside class="fixed top-0 h-full bg-zinc-800 shadow-xl z-40 transition-transform duration-300 ease-in-out border-l border-zinc-700"
           class:translate-x-0={aiPlannerSidebarOpen}
           class:translate-x-full={!aiPlannerSidebarOpen}
           style="right: 0; width: 24rem;" >
        <div class="flex flex-col h-full">
            <div class="flex items-center justify-between shrink-0 px-4 h-16 border-b border-zinc-700">
                <h3 class="text-lg font-semibold text-gray-100">AI Planner</h3>
                <button on:click={toggleAiPlannerSidebar} aria-label="Close AI Planner" class="text-zinc-400 hover:text-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="flex-1 p-4 overflow-y-auto">
                <p class="text-sm text-zinc-300">AI Planner content goes here...</p>
                <p class="text-sm text-zinc-300 mt-2">You can build out the planner's interface within this sidebar.</p>
            </div>
        </div>
    </aside>
</div>

<style>
    nav::-webkit-scrollbar {
        width: 5px;
    }
    nav::-webkit-scrollbar-track {
        background: transparent;
    }
    nav::-webkit-scrollbar-thumb {
        background: #3f3f46;
        border-radius: 10px;
    }
    nav::-webkit-scrollbar-thumb:hover {
        background: #52525b;
    }
    nav {
        scrollbar-width: thin;
        scrollbar-color: #3f3f46 transparent;
    }
</style>