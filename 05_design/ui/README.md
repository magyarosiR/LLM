# Product Management UI

This project is a React UI for managing products, built with Vite and TypeScript.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Getting Started

1.  **Clone the repository**

2.  **Navigate to the `ui` directory:**
    ```bash
    cd 05_design/ui
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env.local` file in the `ui` directory and add the following:
    ```
    VITE_API_BASE_URL=http://localhost:8000
    ```
    Replace the URL with your actual backend API URL if it's different.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Build for Production

To create a production build, run:
```bash
npm run build
```
The bundled files will be in the `dist` directory.
