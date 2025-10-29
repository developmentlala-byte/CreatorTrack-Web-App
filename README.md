md
# CreatorTrack Web App

This project is a static front-end web application designed for task management. It provides a user-friendly interface with dark mode support, built using HTML5, CSS3, Bootstrap 5, Vanilla JS, and Firebase for authentication and data storage.

## Key Features & Benefits

*   **Authentication:** Secure user authentication via Firebase.
*   **Task Management:** Create, view, and manage tasks efficiently.
*   **User Roles:** Differentiated dashboards for administrators and regular users.
*   **Responsive Design:** Utilizes Bootstrap 5 for a responsive and visually appealing layout.
*   **Dark Mode:** Offers a comfortable viewing experience with a built-in dark theme.
*   **Modular JavaScript:** Well-structured JavaScript code for maintainability and scalability.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Web Browser:** A modern web browser (e.g., Chrome, Firefox, Safari).
*   **Text Editor/IDE:** A code editor for modifying the source code (e.g., VS Code, Sublime Text).
*   **Firebase Account:** Required for authentication and Firestore functionality.
*   **Static Server (optional):**  For local development. Python's built-in server or similar tools are sufficient.

## Installation & Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url>
    cd CreatorTrack-Web-App
    ```

2.  **Set up Firebase:**

    *   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable Authentication and Firestore Database in your Firebase project.
    *   Obtain your Firebase configuration from the Firebase Console.

3.  **Configure Firebase in the Application:**

    *   Open the `js/firebase-config.js` file.
    *   Replace the placeholder values with your actual Firebase configuration.

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    export { auth, db };
    ```

4.  **Run the Application Locally:**

    You can use any static server to run the application locally. Here's an example using Python:

    ```bash
    python -m http.server 5500
    ```

    Open your web browser and navigate to `http://localhost:5500/`.

## Usage Examples & API Documentation

### Authentication (Firebase)

*   **Register a new user:**  Refer to `js/auth.js` and `register.html` for user registration implementation using Firebase Auth.
*   **Sign in an existing user:** See `js/auth.js` and `index.html` for login functionality.
*   **Sign out the current user:** Implemented within the JavaScript files handling user sessions.

### Firestore Database

*   **Reading data:**  The `js/tasks.js` file demonstrates how to fetch task data from Firestore.
*   **Writing data:** The `js/tasks.js` and `create-task.html` show the methods for creating new tasks and storing them in Firestore.

*Detailed API usage can be found within the respective JavaScript files, particularly in `js/auth.js`, `js/dashboard.js`, and `js/tasks.js`.*

## Configuration Options

*   **Firebase Configuration:** Configure your Firebase project settings in `js/firebase-config.js`.
*   **CSS Styling:**  Modify the `css/style.css` file to customize the application's appearance. The `:root` section defines dark theme variables, allowing for easy color scheme adjustments.

## Contributing Guidelines

Contributions are welcome!  Follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Submit a pull request.

Please ensure your code adheres to the project's coding style and includes relevant tests.

## License Information

No license specified. All rights reserved by the owner.

## Acknowledgments

*   **Bootstrap:** For providing a robust and responsive CSS framework.
*   **Firebase:** For providing authentication and database services.
*   **Bootstrap Icons:** For providing a set of useful icons.
