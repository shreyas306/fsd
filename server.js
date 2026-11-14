import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./server/api.js";
import { startUnlockWorker } from "./server/unlockWorker.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  const uploadsDir = path.resolve(__dirname, "uploads");
  app.use("/uploads", express.static(uploadsDir));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "Digital Time Capsule API", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.use("/api", apiRouter);
  startUnlockWorker();
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Time Capsule Server] Running smoothly on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[Time Capsule Server] Failed to start:", err);
});
