# DemocraSee ☑️
> Your Smart Election Guide for Every Indian Citizen

Built for Google Developer Prompt War 2025

## Features
- 🤖 AI Chat (Google Gemini)
- 📅 Interactive Election Timeline  
- 🃏 25 Flashcards with spaced repetition
- 📊 Google Charts data visualizations
- ✅ Voter Eligibility Checker
- 🌍 4 languages (EN/Hindi/Tamil/Bengali)
- 🎓 10-question timed quiz with badges

## Google Services
- Google Gemini API (AI responses)
- Google Charts (data visualizations)
- Google Cloud Run (hosting)

## Setup
1. Clone repo
2. Add Gemini API key in `public/app.js`
3. `npm install`
4. `node server.js`
5. Open `localhost:8080`

## Deploy
`gcloud run deploy democrasee --source . --region us-central1 --allow-unauthenticated`
