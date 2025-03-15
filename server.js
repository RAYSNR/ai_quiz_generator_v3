// server.js - Fixes for Railway Auto-Stopping
require('dotenv').config();
console.log("DEBUG: OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "Loaded" : "Not Found");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { OpenAI } = require("openai");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.enable('trust proxy');

const PORT = process.env.PORT || 8080;  // ✅ Ensure dynamic port is used

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ OpenAI setup
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ✅ Test API Endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: "API is working on Railway!" });
});

// ✅ Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ Keep-Alive Mechanism to prevent Railway from stopping the server
setInterval(() => {
    console.log("✅ Keep-alive ping sent to prevent Railway auto-shutdown");
    fetch(`http://localhost:${PORT}/health`)
        .then(() => console.log("✅ Keep-alive successful"))
        .catch((err) => console.error("❌ Keep-alive failed:", err));
}, 5 * 60 * 1000); // Every 5 minutes

// ✅ Handle SIGTERM to prevent sudden Railway shutdown
process.on('SIGTERM', () => {
    console.log("⚠️ Received SIGTERM, shutting down gracefully...");
    server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log("⚠️ Received SIGINT, shutting down gracefully...");
    server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
    });
});

// ✅ Start server with explicit 0.0.0.0 binding for Railway
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is now listening on http://localhost:${PORT}`);
    console.log(`Server running on port ${PORT}`);
});
