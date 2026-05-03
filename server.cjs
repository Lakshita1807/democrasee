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
  // Set requested Permissions-Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Consolidate Helmet & CSP per request
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://firebaseio.com", "https://identitytoolkit.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  xFrameOptions: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { 
    maxAge: 31536000, 
    includeSubDomains: true, 
    preload: false 
  },
}));


// 3. API Routes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests.' }),
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
});

app.get('/api/live-updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT', ts: Date.now() })}\n\n`);
  }, 30000);
  req.on('close', () => clearInterval(interval));
});

app.post('/chat-endpoint', aiLimiter, async (req, res) => {
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/translate', async (req, res) => {
  const { text, target } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target })
    });
    
    const data = await response.json();
    if (data.error) {
        console.error("Translation API Error:", data.error);
        return res.status(data.error.code || 500).json({ error: data.error.message });
    }
    res.json(data);
  } catch (error) {
    console.error("Internal Translation Error:", error);
    res.status(500).json({ error: "Internal Server Error during translation" });
  }
});

app.get('/api/news', (req, res) => {
  res.json([
    { id: 1, category: "National", title: "ECI Announces Final Voter Turnout", summary: "Official figures for Phase 7 released.", date: "May 1, 2024", link: "#" },
    { id: 2, category: "Process", title: "Counting Day Guidelines", summary: "ECI updates transparency rules.", date: "April 30, 2024", link: "#" }
  ]);
});

// 4. Dynamic Index Helper
const serveIndex = (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error');
    res.send(data.replace(/{{CSP_NONCE}}/g, res.locals.cspNonce));
  });
};

// 5. Custom Routes
app.get('/', serveIndex);
app.get('/index.html', serveIndex);

// 6. Static Files (Below custom routes)
app.use(express.static(path.join(__dirname, 'public')));

// 7. Catch-all
app.get('*', serveIndex);

app.listen(PORT, () => console.log(`Server on ${PORT}`));
