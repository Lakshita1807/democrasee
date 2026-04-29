# DemocraSee - Interactive Election Guide

> **"Your Smart Election Guide for Every Indian Citizen"**

DemocraSee is an award-winning, interactive web application designed to educate Indian citizens about the democratic election process. Built with vanilla web technologies, it features a personalized AI assistant, multilingual support, interactive data visualizations, and gamified civic education modules.

## 🌟 Features

- **🤖 AI Election Assistant:** Powered by Google Gemini API, providing personalized, region-specific, and role-based civic education with voice input support.
- **🌐 Multilingual UI:** Seamlessly switch between English, Hindi, Tamil, and Bengali.
- **📅 Interactive Timeline:** A visually engaging step-by-step guide to the 10 phases of the Indian election process.
- **🃏 Spaced Repetition Flashcards:** Learn 25 critical civic terms (like EVM, VVPAT, Model Code of Conduct) with interactive 3D flips and mastery tracking.
- **📊 Real Data Visualization:** Deep dive into historical voter turnout trends and demographics using Google Charts.
- **🧠 Master Election Quiz:** A timed, scored 60-second quiz to test your civic knowledge and earn performance badges.
- **✅ Eligibility Checker:** A quick 3-step wizard to determine voter eligibility and provide actionable registration links.

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES Modules)
- **Design System:** Custom CSS properties, Inter & Poppins fonts, FontAwesome icons
- **Data Visualization:** Google Charts (`loader.js`)
- **AI Integration:** Google Gemini API (`@google/generative-ai` REST implementation)
- **Deployment:** Firebase Hosting (Configuration included)

## 🚀 Setup & Installation

To run DemocraSee locally:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd democrasee
   ```

2. **Configure the AI API:**
   - Get an API key from [Google AI Studio](https://aistudio.google.com/).
   - Copy the example config file:
     ```bash
     cp config.example.js config.js
     ```
   - Open `config.js` and replace `"demo"` with your actual Gemini API key.
   *(Note: You can also just use the "demo" key to test the UI, but AI responses will be mocked, or you can paste your key directly into the UI upon launch).*

3. **Run a local server:**
   Because the app uses ES Modules (`type="module"`), you must serve the files over HTTP (not the `file://` protocol).
   ```bash
   npx serve .
   # OR
   python -m http.server 8000
   ```

4. **Open the app:**
   Navigate to `http://localhost:8000` in your web browser.

## 📝 Assumptions & Constraints

- **No Build Step:** Per requirements, this app is built purely with vanilla JS without a bundler (like Vite/Webpack). Therefore, standard `.env` files cannot be read natively by the browser. Environment configuration is handled via a git-ignored `config.js` file and `localStorage`.
- **API Security:** Because there is no backend, the Gemini API key is used directly in the frontend. In a true production environment, API calls should be routed through a secure backend or Firebase Cloud Function to protect the key.
- **Static Data:** Quiz questions and flashcards are loaded statically from JSON files to ensure performance and reliability, avoiding slow/hallucinated LLM responses for structured gamified content.

## 📄 License

This project is licensed under the MIT License.
