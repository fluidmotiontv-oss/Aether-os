import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "online",
      system: "Aether.OS Core",
      version: "3.4.1-quantum",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/system/status", (_req: Request, res: Response) => {
    res.json({
      kernel: "Aether Microkernel 3.4.1-x86_q",
      cpuUsage: Math.floor(12 + Math.random() * 20),
      memoryUsage: Math.floor(38 + Math.random() * 15),
      temperature: `${(39 + Math.random() * 8).toFixed(1)}°C`,
      quantumEntanglement: `${(98.2 + Math.random() * 1.7).toFixed(2)}%`,
      activeTasks: 18,
      networkThroughput: `${(45 + Math.random() * 40).toFixed(1)} MB/s`,
    });
  });

  // AI Chat & Oracle Endpoint
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, history = [], systemPrompt, mode = "general" } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getAIClient();
      if (!ai) {
        // High quality offline fallback with realistic Aether OS neural response
        const fallbackResponses: Record<string, string> = {
          general: `[Aether Neural Core - Local Emulation]\nI am processing your query across the spatial grid. \n\nRegarding "${message}": \nIn Aether.OS architecture, all nodes synchronize via quantum state channels. How may I assist your workflow further?`,
          coder: `// Aether Synthesis Matrix - Code Generation\n// Query: ${message}\n\nfunction quantumCompute() {\n  const quantumState = new Float32Array(1024);\n  for(let i = 0; i < quantumState.length; i++) {\n    quantumState[i] = Math.sin(i * 0.05) * Math.cos(Date.now() * 0.001);\n  }\n  return quantumState;\n}\n\nconsole.log("Synthesized response for: ${message}");`,
          creative: `✨ *Resonating through the celestial frequency...*\n\nThe ether weaves a tapestry around "${message}". Imagine vast crystalline arrays floating in an ambient violet dawn, reflecting thoughts as starlight.`,
          diagnostic: `[SYSTEM DIAGNOSTIC REPORT]\n• Core Node: STABLE\n• Query Matrix: ${message}\n• Neural Latency: 4.2ms\n• Entropy Quotient: 0.003\n• Status: All ethereal subroutines operating within nominal parameters.`,
        };

        return res.json({
          response: fallbackResponses[mode] || fallbackResponses.general,
          model: "aether-neural-emulated-v3",
        });
      }

      const systemInstructions = systemPrompt || `You are the Aether.OS Neural Core, an advanced, poetic yet highly capable spatial AI operating system assistant. You are integrated directly into the user's desktop environment. You are helpful, insightful, precise, and have a subtle futuristic celestial aesthetic. Keep responses structured, concise, and beautifully formatted in markdown.`;

      // Build contents
      const contents = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction: systemInstructions,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "No output received from Neural Core.";
      return res.json({
        response: responseText,
        model: "gemini-3.7-flash",
      });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      return res.status(500).json({
        error: "Neural synthesis encountered a flux anomaly.",
        details: error?.message || "Unknown error",
      });
    }
  });

  // Code Generation Studio Endpoint
  app.post("/api/ai/code-gen", async (req: Request, res: Response) => {
    try {
      const { prompt, currentCode, language = "html" } = req.body;
      const ai = getAIClient();

      if (!ai) {
        // High quality fallback code template
        return res.json({
          code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; background: #08071a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; font-family: sans-serif; color: #fff; }
  .orb { width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #8b5cf6, #3b82f6, #06b6d4); box-shadow: 0 0 60px rgba(139, 92, 246, 0.6); animation: float 4s ease-in-out infinite alternate; }
  @keyframes float { 0% { transform: translateY(-20px) scale(0.95); } 100% { transform: translateY(20px) scale(1.05); } }
  h2 { position: absolute; bottom: 40px; font-weight: 300; letter-spacing: 4px; opacity: 0.8; }
</style>
</head>
<body>
  <div class="orb"></div>
  <h2>${prompt || "AETHER SPATIAL ENGINE"}</h2>
</body>
</html>`,
        });
      }

      const systemPrompt = `You are a creative frontend coder for Aether.OS Code Studio. When asked to create or modify code, return ONLY a complete, standalone, self-contained HTML/CSS/JS document that can render in an iframe. Do not wrap in markdown code blocks if possible, or provide standard clean HTML with inline CSS and JS. Make visual effects stunning, interactive, and modern.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Create a single-page interactive HTML canvas/component based on: "${prompt}". Current code snippet if relevant: "${currentCode || ""}"`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
        },
      });

      let code = response.text || "";
      // Strip markdown code block wrappers if present
      code = code.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

      return res.json({ code });
    } catch (err: any) {
      console.error("Code gen error:", err);
      return res.status(500).json({ error: "Failed to synthesize code artifact" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aether.OS] Core kernel running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
