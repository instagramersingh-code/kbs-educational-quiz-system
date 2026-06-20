# KBC Educational Quiz System

A KBC (Kaun Banega Crorepati) style interactive educational quiz platform for Class 1-12 students. Built with React, Vite, Express, and Gemini AI.

## Features

- 🎓 AI-generated quiz questions using Gemini
- 📊 Leaderboard & report cards saved to your device
- 🌗 Light & dark theme support
- 🇮🇳 Hindi & English language support
- ⏳ Timeless mode & endless quiz mode

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment — copy `.env.example` to `.env` and fill in your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Run the app:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Deploy to Vercel

1. Push your code to GitHub.
2. Import the project on [vercel.com](https://vercel.com).
3. In **Vercel Dashboard → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini API key
