# Salvia Wellness Dashboard

This is a workplace wellness dashboard with an AI-powered chatbot.

## Running the Server

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Set up your API Key:**

    Create a `.env` file in the root of the project and add your Gemini API key:

    ```
    GEMINI_API_KEY="YOUR_API_KEY"
    ```

3.  **Start the Server:**

    ```bash
    npm start
    ```

4.  **Access the Application:**

    Open your web browser and navigate to `http://localhost:3000`.

## Login Flow

1.  The application now starts at the `login_standalone.html` page.
2.  Log in or sign up using a username and password.
3.  Upon successful login/signup, you will be redirected to `index.html`.
4.  The dashboard will display your logged-in username.
5.  The sign-out button on the dashboard will log you out and redirect you back to `login_standalone.html`.
