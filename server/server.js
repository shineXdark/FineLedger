import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

const allowedOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: "120kb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please retry later." }
}));

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked for this origin."));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "fineledger-api" });
});

app.post("/api/insights", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing GEMINI_API_KEY." });
    }

    const { tx = [], monthly = {}, budgets = {} } = req.body ?? {};
    if (!Array.isArray(tx)) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    const prompt = `You are a strict budgeting analyst. Return exactly 4 concise bullet points. Data: ${JSON.stringify({ tx: tx.slice(-200), monthly, budgets })}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 350, temperature: 0.4 }
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "AI provider call failed.", detail: detail.slice(0, 500) });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insight returned.";
    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error.", detail: String(error?.message || error) });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`FineLedger API listening on http://localhost:${port}`);
});
