# YC Pitch Coach Frontend Documentation

This document provides an overview of the frontend for the `ycombinator.coach` application. The frontend is a single-page application built with HTML, Tailwind CSS, and vanilla JavaScript.

## 1. Overview

The user interface is designed to replicate the look and feel of a real Y Combinator application form. It allows users to input their startup pitch across various sections, submit it, and receive iterative AI-powered feedback to refine their pitch over a three-round conversational process.

## 2. File Structure

-   `index.html`: The main HTML file containing the structure of the application form.
-   `script.js`: The JavaScript file that handles all dynamic behavior, user interactions, and communication with the backend API.
-   `assets/logo.png`: The application logo.
-   `staticwebapp.config.json`: Configuration file for Azure Static Web Apps, defining routing and platform settings.

## 3. HTML Structure (`index.html`)

The `index.html` file is organized into several key components:

-   **Header**: Contains the logo and application title.
-   **Main Layout**: A two-column layout consisting of the main content and a sidebar.
-   **Sidebar (`<aside>`):** A sticky navigation menu that allows users to jump to different sections of the form. The current section is highlighted dynamically as the user scrolls.
-   **Main Content (`<main>`):**
    -   **Pitch Form (`<form id="pitchForm">`):** A long-form container with multiple sections, each corresponding to a part of the YC application (e.g., Founders, Company, Idea).
    -   **Feedback Area (`<div id="pitchResult">`):** A container that is initially hidden. After the form is submitted, this area becomes visible and displays the conversational feedback from the AI coach.
-   **Footer**: Contains the primary action button ("Get YC Feedback") and a "last saved" indicator.

## 4. JavaScript Logic (`script.js`)

The `script.js` file orchestrates the entire user experience. Its key responsibilities are:

### State Management

-   `conversationHistory`: An array that stores the back-and-forth messages between the user and the AI assistant.
-   `originalPitch`: An object that stores all the user's initial form input.
-   `round`: A counter to track the current round of the 3-step feedback process.

### Initialization (`DOMContentLoaded`)

-   **Event Listeners**: The primary event listener is attached to the `pitchForm`'s `submit` event.
-   **Scrollspy (`setupScrollSpy`)**: Implements the dynamic highlighting of the sidebar navigation links based on which section of the form is currently visible on the screen.

### Core Workflow

1.  **Form Submission**: When the user clicks "Get YC Feedback", the script prevents the default form submission, gathers all form data into the `originalPitch` object, and shows a loading state.

2.  **Initial Evaluation**: It sends the `originalPitch` to the backend API. **(Note: This currently calls `/api/evaluate_pitch`, but will be updated to call the new consolidated `/api/coach` endpoint).**

3.  **Conversation Loop**: 
    -   The application enters a multi-round conversation managed by `startConversation`, `handleUserResponse`, and `addUserInput`.
    -   The AI's first question is displayed, and an input box is dynamically added for the user's response.
    -   For each of the `maxRounds` (3), the user's answer is sent to the backend along with the entire conversation history to get the next question. **(This will be updated to call the single `/api/coach` endpoint).**

4.  **Final Summary**: After the final round, the script calls the backend to generate a final, refined pitch based on the entire conversation. **(This will also be updated to call `/api/coach`).**

### UI Update Functions

-   `updateConversationUI()`: Dynamically creates and appends chat bubbles to the feedback area for both user and assistant messages.
-   `displayError()`: Shows a formatted error message in the UI if an API call fails.
-   `displaySummary()`: Renders the final, polished pitch summary.
-   `showLoading()`: Manages the disabled state and text of the main submission button to provide feedback to the user during API calls.
