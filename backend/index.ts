import app from "./src/app";
import { createServer } from "http";
import { connectToMongoDB } from "./src/database/mongodb";
import { PORT as API_PORT } from "./src/configs/constant";
import { createRealtimeWebSocketServer } from "./src/utils/realtime.util.js";

const startServer = async () => {
  await connectToMongoDB();
  const server = createServer(app);
  createRealtimeWebSocketServer(server);

  server.listen(API_PORT, '0.0.0.0', () => {
    console.log(`Server: http://localhost:${API_PORT}`);
  });
};

startServer();
// execute: npx tsx --watch index.ts
// http://localhost:8089