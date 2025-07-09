# NextGen Code Generator

A powerful AI-powered code generation tool built with React and the Gemini API.

## Features

- Generate code snippets, API endpoints, UI components, and more
- Multiple project types including portfolio websites, unit tests, database schemas, and more
- Live preview for generated code
- Responsive design that works on all devices
- Explain code functionality
- Dark/light mode support

## Run Locally

**Prerequisites:** Node.js (v16+)

1. Clone the repository:
   ```
   git clone <repository-url>
   cd NextGen-Code-Generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   ```
   cp .env.example .env.local
   ```
   - Edit `.env.local` and add your Gemini API key
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   API_KEY=your_actual_api_key_here
   ```

4. Run the app:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Environment Variables

The application requires a Gemini API key to function properly. You can get one from the [Google AI Studio](https://ai.google.dev/).

- `VITE_GEMINI_API_KEY`: Your Gemini API key (used by the Vite build process)
- `API_KEY`: Same API key (used by services)

**Important**: Never commit your `.env.local` file to version control. It's already added to `.gitignore` to prevent accidental commits.
