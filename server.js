import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const languageNameMap = {
  zh: "Chinese",
  ko: "Korean",
  en: "English",
  uz: "Uzbek",
  mn: "Mongolian"
};

app.get("/", (req, res) => {
  res.send("Backend is running.");
});

app.post("/api/detect-language", async (req, res) => {
  try {
    const { text } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Identify the language of the user's message.
Return only one code from this list:
zh
ko
en
uz
mn

Rules:
1. Output only the code.
2. No explanation.
3. No punctuation.
4. No extra words.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    let lang = response.choices?.[0]?.message?.content?.trim().toLowerCase() || "";
    lang = lang.replace(/[^a-z]/g, "");

    if (lang.includes("korean")) lang = "ko";
    if (lang.includes("chinese")) lang = "zh";
    if (lang.includes("english")) lang = "en";
    if (lang.includes("uzbek")) lang = "uz";
    if (lang.includes("mongolian")) lang = "mn";

    if (!["zh", "ko", "en", "uz", "mn"].includes(lang)) {
      lang = "zh";
    }

    res.json({ language: lang });
  } catch (error) {
    console.error("detect-language error:", error);
    res.status(500).json({ error: "Language detection failed." });
  }
});

app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    if (!targetLang) {
      return res.status(400).json({ error: "targetLang is required" });
    }

    if (sourceLang === targetLang) {
      return res.json({ translatedText: text });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a precise translation engine.
Translate the user's message from ${languageNameMap[sourceLang] || sourceLang} to ${languageNameMap[targetLang] || targetLang}.

Rules:
1. Only output the translated text.
2. Do not explain.
3. Keep names, numbers, and school terms accurate.
4. Keep the tone natural and polite.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const translatedText =
      response.choices?.[0]?.message?.content?.trim() || text;

    res.json({ translatedText });
  } catch (error) {
    console.error("translate error:", error);
    res.status(500).json({ error: "Translation failed." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});