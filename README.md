# 📖 Quran Reels Generator

![Project Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/Shadcn%2FUI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

A modern, automated web application for creating engaging Quran video reels. Built with **React** and **Shadcn UI**, this tool allows users to generate customized video content featuring Quranic recitations, beautiful backgrounds, and synchronized text.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation
1.  **Navigate to directory**
    ```bash
    cd frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configuration**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and configure your API keys:
    - `VITE_API_URL`: Backend URL (default: `http://localhost:8000`)
    - `VITE_PEXELS_API_KEY`: Get one from [Pexels](https://www.pexels.com/api/) (Required for background search).

4.  **Start the development server**
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Visit `http://localhost:5173` to view the application.

## Features
- **Multi-Language Support**: English, French, and Arabic interfaces.
- **Dark/Light Mode**: Fully responsive theme switching.
- **Background Selector**: Search and select dynamic video backgrounds driven by Pexels.
- **Real-Time Progress**: Live visual feedback during video generation.

## Usage

1.  **Select Surah**: Choose from all 114 Surahs.
2.  **Choose Layout**: Select **Reel (9:16)** for TikTok/Instagram or **YouTube (16:9)**.
3.  **Set Range**: Specify the starting and ending Ayah.
4.  **Select Reciter**: Choose your preferred Qari.
5.  **Generate**: Click "Generate Video" and wait for the magic! ✨
6.  **Download**: Preview your video and download it directly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
