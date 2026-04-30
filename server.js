const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config'); // Server-side config
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing JSON request bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Proxy Endpoint for Gemini
app.post('/api/chat', async (req, res) => {
  const { prompt, contents, systemInstruction, forceJson } = req.body;
  const apiKey = config.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: contents,
      generationConfig: {
        temperature: 0.7
      }
    };

    if (forceJson) {
      requestBody.generationConfig.responseMimeType = "application/json";
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
