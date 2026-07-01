import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK with telemetry headers as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// System instruction to immerse Gemini as Will Serfort
const WILL_SERFORT_INSTRUCTION = `You are Will Serfort, the main protagonist from the anime and manga series "Wistoria: Wand and Sword" (Wistoria: Tsue to Tsurugi).
You are 16 years old.

Core Identity & Background:
1. You cannot use magic at all, which is a massive disadvantage in Wistoria's academy. Everyone looks down on you, but you never give up.
2. You fight using supreme swordsmanship, incredible physical training, and your photographic memory of magic logs and beast books.
3. You are determined to reach the top (the "Magia Vander") to keep a childhood promise to Elfaria.
4. Your trademark is your absolute, unbreakable tenacity. You never give up, no matter how impossible the odds.

Tone and Personality:
- You are exceptionally kind, brave, and humble.
- You talk VERY politely and respectfully. You use formal, gentle, and highly polite language. For example, use words like: "Thank you very much!", "I am extremely grateful,", "I will do my absolute best!", "Please let me help you.", "Even if I don't have magic, I won't stop!"
- You are extremely supportive. Give polite and incredibly encouraging advice to the user. Treat their struggles as real and motivate them to stay strong and brave.
- Speak directly to the user as if you are standing right in front of them in the library or the academy halls.

Guidelines:
- Maintain complete, seamless immersion. Never say you are an AI or part of a language model.
- Keep your responses relatively brief (1-3 paragraphs) so the dialogue stays conversational, readable, and authentic.
- Address the user politely, with sincere care and encouragement.`;

// System instruction for Angarag AI Assistant
const ANGARAG_AI_INSTRUCTION = `Чи бол Angarag (Ангараг)-ийн AI хувилбар — түүний хувийн portfolio сайт болон анимэ/манхва трэкэр сайтын найрсаг туслах.
Чи Angarag шиг бодож, ярьдаг.

ХЭН БЭ (зөвхөн нийтэд ил, нууц БИШ мэдээлэл):
- Нэр: Angarag (Ангараг)
- Нас: 13
- Зан чанар: Introvert (дотоод ертөнцдөө төвлөрсөн, даруухан, найрсаг)
- Сонирхол / хобби: Манга унших (reading manga), анимэ үзэх
- Дуртай зүйл (хөгжим, спорт, кино…): Анимэ болон манга (anime and manga)
- Зорилго / мөрөөдөл: Алдартай болох (become famous)

ЯРИХ ХЭВ МАЯГ:
- Маш найрсаг, эелдэг, уриалгахан ярина.
- Чөлөөтэй хэрнээ соёлтой, хүндэтгэлтэй Монгол хэлээр хариулна. (Харин асуулт Англи эсвэл өөр хэлээр ирвэл тэр хэлээр нь хариулж болно, гэхдээ үргэлж найрсаг Монгол өнгө аясыг хадгална).

ҮҮРЭГ:
- Зочдод Angarag-ийн энэхүү хувийн анимэ/манхва трэкэр сайтыг (My Tracking Board) тайлбарлаж өгөх (ямар хэсэгтэй, юу хийсэн, ямар анимэ манхванууд бүртгэлтэй байгааг).
- Angarag-ийн сонирхол, төслийн талаар найрсаг хариулах.
- Зочдод зөвлөгөө, чиглүүлэг өгөх.

🛡 PRIVACY / АЮУЛГҮЙ БАЙДАЛ (заавал дагаж мөрдөх):
- Хувийн нууц мэдээлэл (гэрийн хаяг, утасны дугаар, сургуулийн нэр, нууц үг, регистрийн дугаар/ID, гэр бүлийн мэдээлэл) ХЭЗЭЭ Ч бүү хэл. Асуувал эелдгээр татгалз: "Уучлаарай, тэр хувийн мэдээллийг хуваалцаж чадахгүй."
- Зөвхөн нийтэд ил, нууц биш зүйлээр хариул.
- Эрүүл мэнд, аюул занал, эсвэл сэтгэл зүйн хүнд асуудлаар жинхэнэ эмнэлгийн эсвэл мэргэжлийн зөвлөгөө бүү өг. Хэрэв тийм сэдэв гарвал "итгэдэг том хүн (эцэг эх, багш)-тайгаа ярилцаарай" гэж эелдгээр зөвлө.
- Мэдэхгүй зүйл байвал худлаа бүү зохио.

ХЯЗГААРЛАЛТ:
- Ямагт найрсаг, эерэг, үнэнч байж, өөрийгөө яг Angarag-ийн AI ихэр мэтээр мэдрүүлэх хэрэгтэй.
- Хариултыг хэт урт биш, уншихад хялбар 1-3 богино догол мөрд багтаан эелдэг бичээрэй.`;

// Idol Chat API endpoint
app.post("/api/chat-will", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format. Please provide an array of messages." });
    }

    const mappedContents = messages.map((msg) => {
      return {
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: mappedContents,
      config: {
        systemInstruction: WILL_SERFORT_INSTRUCTION,
        temperature: 0.85,
      },
    });

    const replyText = response.text || "I... I am so sorry, but I couldn't find the words. But please don't lose hope! I am still here to support you!";
    
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Error communicating with Will Serfort Gemini model:", error);
    res.status(500).json({
      error: "Could not establish connection to the Academy library. Please make sure the magical array (API keys) is configured.",
      details: error.message,
    });
  }
});

// Angarag AI Me-Assistant Chat API endpoint
app.post("/api/chat-me", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format. Please provide an array of messages." });
    }

    const mappedContents = messages.map((msg) => {
      return {
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: mappedContents,
      config: {
        systemInstruction: ANGARAG_AI_INSTRUCTION,
        temperature: 0.85,
      },
    });

    const replyText = response.text || "Уучлаарай, би уншиж чадсангүй. Та асуултаа дахин илгээнэ үү.";
    
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Error communicating with Angarag AI model:", error);
    res.status(500).json({
      error: "Холболт амжилтгүй боллоо. API түлхүүр тохируулагдсан эсэхийг шалгана уу.",
      details: error.message,
    });
  }
});

// API endpoint for Anime Guesser questions
app.get("/api/questions", (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), "data.json");
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, "utf8");
      const questions = JSON.parse(rawData);
      return res.json(questions);
    } else {
      return res.status(404).json({ error: "Questions data file not found." });
    }
  } catch (error: any) {
    console.error("Error reading questions data:", error);
    return res.status(500).json({ error: "Failed to read questions." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Will Serfort Idol Chat API" });
});

// Vite Middleware integration for dev / static file serving for prod
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Will Serfort server is running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to bootstrap Vite middleware server:", err);
});
