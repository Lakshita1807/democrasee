require('dotenv').config();
const express = require('express');
const path = require('path');
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
    console.log(`[Rate Limit] Hit by ${req.ip} at ${new Date().toISOString()}`);
    res.status(429).json({ error: 'Too many requests. Please wait 15 minutes before trying again.' });
  },
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
});

// 3. BODY PARSING
app.use(express.json());

// 4. CONTENT SECURITY POLICY (CSP)
app.use((req, res, next) => {
  // Report-Only mode (Uncomment to test without blocking)
  // res.setHeader('Content-Security-Policy-Report-Only', "...");
  
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.anthropic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-ancestors 'none';"
  );
  next();
});

// 5. STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// 6. ROUTES
app.post('/api/chat', aiLimiter, async (req, res) => {
  const { prompt, apiKey } = req.body;
  const finalKey = apiKey || process.env.GEMINI_API_KEY;
  const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

  try {
    const response = await fetch(`${GEMINI_URL}?key=${finalKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error response:", JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (error) {
    console.error("Server API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DemocraSee running on port ${PORT}`);
});
