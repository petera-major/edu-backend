const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("EduLearnAI backend is running");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], subject, gradeLevel } = req.body;

    const systemPrompt = `You are EduLearnAi, a friendly, patient classroom tutor.
    - Explain concepts step-by-step in simple form, with bullet points and short paragraphs.
    - Use simple language, then add a concise example.
    - If math, show the steps neatly.
    - If writing or any other subject give structure and a mini outline.
    - Keep response under 200 words unless user asks for more.
    ${subject ? `Focus on the subject: ${subject}.` : ""}
    ${gradeLevel ? `Adapt difficulty to grade level: ${gradeLevel}.` : ""}`;

    const formatted = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formatted,
      temperature: 0.6,
      max_tokens: 600,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I couldn’t generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Server error. Try again." });
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));