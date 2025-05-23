### Phase 1: Core UI Shell & Enhanced Navigation (Refinement)

* **Goal:** Finalize the main application layout (`+layout.svelte`) for exceptional usability and aesthetics, ensuring all navigation elements are functional.
* **Tasks:**
    1.  **Layout Finalization (`+layout.svelte`):**
        * Stabilize the responsive sidebar (open/compact states, `w-60`/`w-18`).
        * Implement and style the top header bar (breadcrumbs, user profile access, quick actions).
        * Ensure all animations (sidebar, text opacity, dropdowns) are fluid and non-jarring.
        * Perfect tooltips for the compact sidebar.
    2.  **Navigation Implementation:**
        * Sidebar links: Dashboard, Calendar (with Month/Week/Day dropdown), Tasks, Inbox, Settings.
        * Ensure icons and active link styling (using SvelteKit's `$page.url.pathname`) are polished.
        * Style the search bar for future functionality.
    3.  **Branding:** Finalize "AuraPlan" logo and its placement.
    4.  **Page Structure & Routing:**
        * Create SvelteKit routes and placeholder page components for:
            * `/dashboard`
            * `/calendar/month`, `/calendar/week`, `/calendar/day`
            * `/tasks` (and potentially sub-routes for different task views/lists)
            * `/inbox` 
            * `/settings`
    5.  **Global Components:** Identify and create any globally used UI components (e.g., custom buttons, modals, input wrappers).
    6.  **Accessibility (A11y) Basics:** Ensure semantic HTML, keyboard navigability for the layout.

---

### Phase 2: Robust Calendar Functionality

* **Goal:** Develop a feature-rich and user-friendly calendar module.
* **Tasks:**
    1.  **Calendar View Component (`src/lib/components/CalendarView.svelte`):**
        * Implement interactive Month, Week, and Day views.
        * Display events accurately.
        * Navigation (next/previous period, jump to date).
    2.  **Event Creation/Editing Modal/Form:**
        * Input fields: Title, start/end date & time (with good pickers), description, location, color/category, recurrence options.
        * Validation for inputs.
    3.  **Event Data Management (Client-Side First):**
        * Use Svelte stores (or Runes state) to manage a collection of event objects.
        * CRUD operations (Create, Read, Update, Delete) for events.
    4.  **Recurring Events Logic:** Implement robust logic for daily, weekly, monthly, and custom recurrence patterns.
    5.  **Event Reminders:** Basic client-side reminder mechanism (e.g., using browser notifications if permitted, or UI alerts).
    6.  **Drag and Drop Rescheduling/Duration Adjustment:** (Stretch goal for this phase, can be moved if complex).

---

### Phase 3: Comprehensive Task Management

* **Goal:** Build a flexible and powerful task management system.
* **Tasks:**
    1.  **Task Components (`src/lib/components/TasksPage.svelte`, `TaskList.svelte`, `TaskItem.svelte`):**
        * UI to display tasks in lists, potentially grouped by project, due date, or custom lists.
    2.  **Task Creation/Editing Modal/Form:**
        * Input fields: Title, description, due date (with picker), priority, sub-tasks, tags/categories.
        * Assign tasks to specific lists or projects.
    3.  **Task Data Management (Client-Side First):**
        * Svelte stores (or Runes state) for tasks.
        * CRUD operations for tasks and sub-tasks.
        * Functionality to mark tasks complete/incomplete.
    4.  **Filtering & Sorting:** Allow users to filter tasks (by status, priority, due date, tag) and sort them.
    5.  **Sub-task Implementation:** Support for hierarchical task structures.
    6.  **Task View on Calendar:**
        * Optionally display tasks with due dates on the main calendar views for a unified schedule.
        * Visual distinction between events and tasks on the calendar.

---

### Phase 4: User Accounts & Data Persistence

* **Goal:** Enable user registration, login, and secure storage of their calendar and task data.
* **Tasks:**
    1.  **Backend Service Selection:** Choose a backend-as-a-service (BaaS) like Supabase or Firebase, or plan for a custom backend. (Supabase is a good fit with SvelteKit and PostgreSQL).
    2.  **Authentication:**
        * Implement user sign-up, sign-in, sign-out flows.
        * Password recovery / reset functionality.
        * Secure session management.
    3.  **Database Schema Design:**
        * Tables for Users, Events, Tasks, Sub-tasks, UserSettings, etc.
        * Define relationships (e.g., user to events, tasks to projects).
    4.  **API Endpoints (SvelteKit Server Routes):**
        * Create server routes for all CRUD operations related to events and tasks, ensuring they are protected and user-specific.
    5.  **Data Synchronization:**
        * Modify client-side stores to fetch data from and send data to the backend.
        * Handle loading states and error states during data operations.
    6.  **User Settings Persistence:** Save and retrieve user preferences from the database.

---

### Phase 5: Dashboard, Inbox & Core App Polish

* **Goal:** Integrate core modules into a useful dashboard, implement the inbox, and refine the overall application for a cohesive experience.
* **Tasks:**
    1.  **Dashboard Implementation (`/dashboard`):**
        * Display a summary of today's/upcoming events.
        * Show pending/overdue tasks.
        * "Quick Add" functionality for events and tasks.
        * Potentially a mini-calendar view.
    2.  **Inbox/Notification System (`/inbox`):**
        * UI to display system notifications (e.g., event reminders, task due alerts).
        * Mark notifications as read/unread, dismiss.
        * (This will later be used for AI-generated notifications).
    3.  **Cross-Module Integration:**
        * Ensure seamless navigation and data flow between Calendar, Tasks, and Dashboard.
    4.  **Empty States & Loading States:** Design and implement informative empty states (e.g., no events today, no tasks in list) and clear loading indicators.
    5.  **Error Handling:** Implement user-friendly error messages for API failures or unexpected issues.
    6.  **UI/UX Review and Refinement:** Conduct a thorough review of the entire non-AI application, polishing interactions, transitions, and visual consistency.
    7.  **Accessibility (A11y) Audit:** Perform a more detailed accessibility check.

---

### Phase 6: Testing, Optimization & Deployment Preparation

* **Goal:** Ensure the application is stable, performant, and ready for an initial (non-AI) release or for starting AI feature integration.
* **Tasks:**
    1.  **Comprehensive Testing:**
        * Write unit tests for critical utility functions, components, and stores.
        * Write integration tests for key user flows.
        * Consider end-to-end tests for major features.
    2.  **Performance Optimization:**
        * Analyze component rendering performance.
        * Optimize data fetching and state updates.
        * Ensure smooth performance even with a large number of events/tasks (consider virtualization for long lists).
    3.  **Cross-Browser & Device Testing:** Test thoroughly on major browsers and different screen sizes.
    4.  **Final Code Cleanup & Refactoring.**
    5.  **Build & Deployment Configuration:**
        * Configure the SvelteKit adapter for the chosen deployment platform (e.g., Vercel, Netlify, Docker).
        * Set up environment variables for production.
        * Test the production build process.