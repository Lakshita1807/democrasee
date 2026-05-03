require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);

// 1. Body Parsing
app.use(express.json());

// 2. Nonce & Security
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'no-referrer' },
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`, "https://cdnjs.cloudflare.com", "https://www.gstatic.com", "https://unpkg.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
    connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://newsapi.org", "https://firestore.googleapis.com", "https://www.googleapis.com", "https://identitytoolkit.googleapis.com", "https://*.firebaseio.com"],
    imgSrc: ["'self'", "data:", "https:"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));

// 3. API Routes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests.' }),
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
});

app.post('/chat-endpoint', async (req, res) => {
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "API Key missing" });
  
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/news', (req, res) => {
  res.json([
    { id: 1, category: "National", title: "ECI Announces Final Voter Turnout", summary: "Official figures for Phase 7 released.", date: "May 1, 2024", link: "#" },
    { id: 2, category: "Process", title: "Counting Day Guidelines", summary: "ECI updates transparency rules.", date: "April 30, 2024", link: "#" }
  ]);
});

// 5. Dynamic Index Helper
const serveIndex = (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error');
    res.send(data.replace(/{{CSP_NONCE}}/g, res.locals.cspNonce));
  });
};

// 6. Routes
app.get('/', serveIndex);

// 7. Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 8. Catch-all for SPA
app.get('*', serveIndex);

app.listen(PORT, () => console.log(`Server on ${PORT}`));
