# Quran Reels Frontend

This is the React frontend for the Quran Reels application, built with Vite, Tailwind CSS, and shadcn/ui. It provides a beautiful interface for users to generate and download Quran videos.

## Features
- **Modern UI**: Dark mode, glassmorphism, and animated backgrounds.
- **Responsive Design**: Works on desktop and mobile.
- **Preview Player**: Watch the generated video directly in the browser.
- **Customization**: Select Surah, Ayah range, Reciter, and Video Format.

## Tech Stack
- **React 19**: UI Library.
- **Vite**: Build tool.
- **Tailwind CSS v4**: Styling.
- **shadcn/ui**: Reusable UI components.
- **Lucide React**: Icons.

## Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Configuration
The frontend connects to the backend at `http://localhost:8000/api/v1`. This is configured in `src/api/video.js`.
