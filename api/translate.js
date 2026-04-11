import OpenAI from "openai";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text, sourceLang, targetLang } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    if (!targetLang) {
      return res.status(400).json({ error: "targetLang is required" });
    }

    if (sourceLang === targetLang) {
      return res.status(200).json({ translatedText: text });
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
4. Keep the tone natural and polite.
5. Do not translate Chinese business titles literally when unnatural.
6. For titles like “X总”, use a natural business honorific in the target language based on context.
7. In Korean, expressions like “王总 / 李总 / 金总” should usually be rendered naturally as “왕 대표님 / 이 대표님 / 김 대표님” rather than literal forms like “왕총 / 이총 / 김총”.
8. Prefer natural real-world business usage over word-for-word translation.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const translatedText =
      response.choices?.[0]?.message?.content?.trim() || text;

    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error("translate error:", error);
    return res.status(500).json({ error: "Translation failed." });
  }
}
