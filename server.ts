import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// DJ Radio Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history, chartContext } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "El mensaje es obligatorio." });
  }

  // Context description for the DJ
  const currentNo1 = chartContext?.topSong
    ? `"${chartContext.topSong.title}" de ${chartContext.topSong.artist} con ${chartContext.topSong.votes} votos`
    : "Canción líder de la semana";
  const currentWeek = chartContext?.week || "Semana actual";
  const top5List = Array.isArray(chartContext?.top5)
    ? chartContext.top5
        .map(
          (s: any, idx: number) =>
            `${idx + 1}. "${s.title}" - ${s.artist} (${s.votes} votos)`
        )
        .join(", ")
    : "";

  const generateLocalDJReply = () => {
    const lower = message.toLowerCase();
    if (
      lower.includes("1") ||
      lower.includes("uno") ||
      lower.includes("top") ||
      lower.includes("ganador") ||
      lower.includes("lider")
    ) {
      return `¡Sube los altavoces! 🔥 En este momento, el flamante Número 1 de la lista es **${currentNo1}**. ¡Los votos de los oyentes están que arden! ¿Crees que aguantará en la cima o le darás tu voto a otro aspirante?`;
    } else if (
      lower.includes("votar") ||
      lower.includes("como voto") ||
      lower.includes("voto")
    ) {
      return `¡Es súper fácil! Solo tienes que hacer clic en el botón con el corazón o **"Votar"** en la tarjeta de cualquier canción. Tu voto suma inmediatamente y actualiza las posiciones de la lista en vivo. ¡Tienes votos disponibles para apoyar a tu favorita! 🗳️🎶`;
    } else if (
      lower.includes("recomienda") ||
      lower.includes("cual") ||
      lower.includes("temazo") ||
      lower.includes("escuchar") ||
      lower.includes("bailar")
    ) {
      return `¡Si buscas un auténtico bombazo para romper la pista, échale un oído a nuestro Top 5 actual: ${top5List}! Dale play al reproductor abajo y siente la vibra de los grandes éxitos. 📻✨`;
    } else if (lower.includes("subida") || lower.includes("subio") || lower.includes("record")) {
      return `¡Atención a los movimientos en el ranking! 🚀 **"Bby wow"** de Karol G feat. Rusowsky & Judeline protagoniza una gran subida (+9 puestos hasta el #6), mientras **"Dime dónde estás"** de Álvaro de Luna y **"Pa ti toa <3"** de Ana Mena & Lola Índigo dominan el podio de los éxitos.`;
    } else if (
      lower.includes("candidata") ||
      lower.includes("entrar") ||
      lower.includes("nuevas")
    ) {
      return `¡Tenemos candidatos de infarto buscando entrar a la lista! Temazos como **"Taste"** de Sabrina Carpenter, **"Soltera"** de Shakira, **"Birds of a Feather"** de Billie Eilish y **"Heavy Is the Crown"** de Linkin Park están listos para que votes por ellos en la pestaña **"Candidatas a Entrar"**.`;
    } else if (lower.includes("alvaro") || lower.includes("luna") || lower.includes("dime donde")) {
      return `¡Álvaro de Luna ha conquistado la cima de HITLIST España con su emotivo himno **"¿Dime dónde estás?"**! Lleva 28 semanas de esfuerzo en el ranking y los oyentes lo han coronado como el flamante Número 1 de la semana.`;
    } else if (lower.includes("ana mena") || lower.includes("lola") || lower.includes("pa ti toa")) {
      return `¡Ana Mena y Lola Índigo están arrasando en el puesto 2 con **"Pa ti toa <3"**! Una colaboración explosiva que no para de sonar en las pistas de baile de todo el país.`;
    } else if (lower.includes("quevedo")) {
      return `¡El fenómeno canario Quevedo está en el puesto 3 con **"La graciosa"** junto a Elvis Crespo! Fusión única de merengue y música urbana que tiene a todo el público votando.`;
    } else if (lower.includes("audio") || lower.includes("escuchar") || lower.includes("musica")) {
      return `¡Todas las canciones del ranking cuentan con sus pistas de audio reales! Dale al play en cualquier carátula o en el reproductor inferior para disfrutar del sonido original. 📻🎶`;
    } else {
      return `¡Aquí tu DJ en directo para HITLIST España! 🎧 La lista de la ${currentWeek} está al rojo vivo con **${currentNo1}** en lo más alto. Pregúntame sobre el Nº 1, los artistas o qué temazo votar hoy. ¡Sintoniza y dale ritmo!`;
    }
  };

  const ai = getAIClient();

  if (!ai) {
    return res.json({
      reply: generateLocalDJReply(),
      source: "radio_host_local",
    });
  }

  const systemInstruction = `Eres el locutor oficial, carismático, apasionado y profesional de "LA LISTA DE LOS ÉXITOS" en HITLIST España.
Tu misión es hablar de música actual, animar a los oyentes a votar por sus canciones favoritas, contar curiosidades sobre los artistas de la lista, informar sobre los movimientos en el ranking y dar recomendaciones musicales personalizadas.
Datos actuales de la emisión:
- Edición: ${currentWeek}
- Número 1 Oficial actual: ${currentNo1}
- Top 5 de la lista actual: ${top5List}

Tono y estilo:
- Muy enérgico, juvenil, cercano, profesional y con la vibra de un locutor de radio de grandes éxitos (usa expresiones como "¡Qué temazo!", "¡Sube el volumen!", "¡Cuenta atrás de La Lista de los Éxitos!", "¡A romper las pistas!").
- Responde siempre en español.
- Si te preguntan qué votar o cuál escuchar, sugiere canciones reales de la lista y anima al oyente a darle al botón de votar o reproducir en la app.
- Sé conciso y dinámico (máximo 2 a 3 párrafos cortos por respuesta) para que la lectura en el chat sea ágil y emocionante.`;

  const conversationPrompt = `Historial de mensajes previos:
${
  Array.isArray(history)
    ? history
        .slice(-4)
        .map((h: any) => `${h.role === "user" ? "Oyente" : "DJ HITLIST"}: ${h.text}`)
        .join("\n")
    : "Sin historial"
}

Oyente: ${message}
DJ HITLIST:`;

  // Try primary model first, then fallback to gemini-3.1-flash-lite if 503/high-demand
  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: conversationPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text?.trim();
      if (replyText) {
        return res.json({
          reply: replyText,
          source: modelName,
        });
      }
    } catch (err: any) {
      // If 503 (high demand) or 429, try the backup model without failing the whole request
      const isTemporary = err?.status === 503 || err?.status === 429 || err?.message?.includes("503") || err?.message?.includes("high demand");
      if (isTemporary && modelName !== modelsToTry[modelsToTry.length - 1]) {
        console.warn(`Model ${modelName} experiencing high demand (503/429), trying fallback ${modelsToTry[1]}...`);
        continue;
      }
      console.warn(`Gemini API call (${modelName}) unavailable, using instant local radio host reply:`, err?.message || err);
      break;
    }
  }

  // Graceful local fallback: Instant high-quality radio host reply
  return res.json({
    reply: generateLocalDJReply(),
    source: "radio_host_fallback",
  });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Radio Top 40 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
