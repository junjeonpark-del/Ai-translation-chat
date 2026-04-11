import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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

    return res.status(200).json({ language: lang });
  } catch (error) {
    console.error("detect-language error:", error);
    return res.status(500).json({ error: "Language detection failed." });
  }
}
