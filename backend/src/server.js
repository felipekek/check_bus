// backend/src/server.js
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

// No Vercel, o app é exportado e NÃO deve iniciar o listen
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor CheckBus rodando em http://localhost:${PORT}`);
  });
}

export default app;
