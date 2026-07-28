import app from "./app.js";
import chalk from "chalk";
import { createServer } from "http";
import { connectToMongoDB } from './database/mongodb.js';
import { PORT, FRONTEND_URL, GOOGLE_CALLBACK_URL } from './config/constants.js';
import { createRealtimeWebSocketServer } from './shared/utils/realtime.util.js';

const startServer = async () => {
  try {
    await connectToMongoDB();
    const server = createServer(app);
    createRealtimeWebSocketServer(server);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(chalk.green('Server running on ') + chalk.yellow(`http://localhost:${PORT}`));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
