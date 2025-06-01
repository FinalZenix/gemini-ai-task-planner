# Gemini AI Task Planner

## Description

Gemini AI Task Planner is an AI-powered application designed to help users manage their tasks, appointments, and notes effectively. It provides an intuitive interface for planning daily and weekly activities, leveraging AI to streamline the process (though the AI aspect is more of a future goal/concept at this stage of development based on the provided codebase). The application features a comprehensive calendar, note-taking capabilities, and robust event management.

## Features

- **User Authentication**: Secure login and registration functionality using Firebase Authentication.
- **Interactive Calendar View**: A weekly calendar view to display and manage events.
- **Event Management**:
    - Create, edit, and delete various types of events: Tasks, Routines, Appointments.
    - Support for All-Day events.
- **Recurring Events**:
    - Set events to recur daily.
    - Set events to recur weekly on specific selected days.
- **Drag & Drop Event Rescheduling**: Easily reschedule events by dragging and dropping them to new time slots or days within the weekly calendar.
- **Event Color Coding & Types**: Visually distinguish between different event types (Task, Routine, Appointment) using color codes.
- **Notes Management**: Create, edit, and delete textual notes.
- **Task Management**: While less prominent in the direct calendar view, the underlying `firestoreService` includes capabilities for managing tasks.
- **Responsive Design**: The application is designed to be usable across different screen sizes.
- **Firebase Firestore for Data Storage**: Utilizes Firebase Firestore to store and sync user data (events, notes) in real-time.

## Tech Stack

- **Frontend**: SvelteKit
- **Backend & Database**: Firebase (Authentication, Firestore)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v18.x or later recommended)
- npm, pnpm, or yarn
- A Firebase Account and a new Firebase Project

## Getting Started

Follow these steps to get the project up and running on your local machine:

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    # pnpm install
    # or
    # yarn install
    ```

3.  **Firebase Setup**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   **Enable Firestore Database**:
        *   From your project dashboard, go to "Firestore Database" and click "Create database".
        *   Start in "test mode" for initial development (you can set up security rules later). Choose a Firestore location.
    *   **Enable Authentication**:
        *   Go to "Authentication" from the project dashboard.
        *   Click on the "Sign-in method" tab.
        *   Enable "Email/Password" provider.
    *   **Obtain Firebase Configuration**:
        *   In your Firebase project dashboard, go to Project Settings (click the gear icon next to "Project Overview").
        *   Under the "General" tab, scroll down to "Your apps".
        *   Click on the web icon (`</>`) to create a new web app or select an existing one.
        *   Register your app and you'll be provided with a `firebaseConfig` object. Copy these credentials.
    *   **Create `src/lib/firebase.ts`**:
        Create a file named `firebase.ts` inside the `src/lib/` directory and paste your Firebase configuration into it. The file should look like this:

        ```typescript
        import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
        import { getAuth, type Auth } from 'firebase/auth';
        import { getFirestore, type Firestore } from 'firebase/firestore';

        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
        };

        let app: FirebaseApp;
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }

        export const db: Firestore = getFirestore(app);
        export const auth: Auth = getAuth(app);
        ```
        **Important**: Replace `"YOUR_API_KEY"`, `"YOUR_AUTH_DOMAIN"`, etc., with your actual Firebase project credentials.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal).

## Usage

1.  **Authentication**:
    *   Navigate to the application.
    *   Register for a new account using your email and password.
    *   Login with your credentials.
2.  **Calendar View**:
    *   Once logged in, you'll be presented with the weekly calendar view.
    *   Navigate to previous or next weeks using the provided controls.
    *   Click on a time slot or an existing event to open the event creation/editing modal.
3.  **Event Management**:
    *   **Create**: Click on an empty time slot in the calendar or the "Add Event" button (if available) to open the event modal. Fill in the details (title, type, date, time, duration, recurrence) and save.
    *   **Edit**: Click on an existing event in the calendar. The modal will open with its details. Modify as needed and save.
    *   **Delete**: Open an existing event and use the delete option in the modal.
    *   **Drag & Drop**: Click and hold an event in the calendar, then drag it to a new time slot or day and release to reschedule.
4.  **Notes Section**:
    *   Navigate to the "Notes" section (usually via a link or tab in the application).
    *   **Create**: Click a "New Note" button, enter your note content, and save.
    *   **Edit**: Select an existing note to open it for editing.
    *   **Delete**: Open a note and use the delete option.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these general steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to your branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request to the main repository.

Please ensure your code adheres to the existing style and that any new features are well-tested.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details (if one is created - otherwise, assume MIT).
