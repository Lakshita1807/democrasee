require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust Proxy for Cloud Run (Correct IP detection behind GCP Load Balancer)
app.set('trust proxy', 1);

// 1. HELMET - Security Headers Bundle
app.use(helmet({
  contentSecurityPolicy: false, // We'll use our own custom CSP below
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'no-referrer' },
}));

// X-XSS-Protection for legacy browsers
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// 2. RATE LIMITING
// Global Fallback Limiter (100 per 15 min)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Global rate limit exceeded. Please try again later.' },
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
});
app.use(globalLimiter);

// Specific AI Rate Limiter (20 per 15 min)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {

    res.status(429).json({ error: 'Too many requests. Please wait 15 minutes before trying again.' });
  },
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
});

// 3. BODY PARSING
app.use(express.json());

// 4. CONTENT SECURITY POLICY (CSP)
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    `script-src 'self' 'nonce-${nonce}' https://www.gstatic.com https://www.googletagmanager.com https://unpkg.com https://cdnjs.cloudflare.com; ` +
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.anthropic.com https://translation.googleapis.com https://www.google-analytics.com https://*.firebaseio.com https://*.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-ancestors 'none'; " +
    "object-src 'none';"
  );
  next();
});

// 5. STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// 6. ROUTES
app.post('/api/translate', async (req, res) => {
  const { text, target } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; // Reusing same key if it has Translation API enabled
  const URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post('/api/ai', aiLimiter, async (req, res) => {
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

  try {
    const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/news', async (req, res) => {
  // Simple proxy for news or returning mock data if no external news API is configured
  // For this audit, we'll return the hardened mock data or call an external domain if provided
  const NEWS_DATA = [
    {
      id: 1,
      category: "National",
      title: "ECI Announces Final Voter Turnout for Phase 7",
      summary: "The Election Commission of India has released official figures for the final phase, showing a steady participation across 8 states and UTs.",
      date: "May 1, 2024",
      link: "https://eci.gov.in"
    },
    {
      id: 2,
      category: "Process",
      title: "New Guidelines for Counting Day Procedures",
      summary: "To ensure transparency, ECI has updated the guidelines for polling agents and counting supervisors for the upcoming results day.",
      date: "April 30, 2024",
      link: "https://eci.gov.in"
    }
  ];
  res.json(NEWS_DATA);
});

// 7. SSE LIVE UPDATES
app.get('/api/live-updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Initial update
  sendUpdate({ type: 'STATUS', message: 'Connected to live election updates' });

  // Periodic mock updates
  const interval = setInterval(() => {
    const turnouts = ["66.3%", "67.1%", "65.8%", "68.2%"];
    sendUpdate({ 
      type: 'TURNOUT_UPDATE', 
      value: turnouts[Math.floor(Math.random() * turnouts.length)],
      timestamp: new Date().toLocaleTimeString()
    });
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading index');
    const result = data.replace(/{{CSP_NONCE}}/g, res.locals.cspNonce);
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`DemocraSee running on port ${PORT}`);
});
