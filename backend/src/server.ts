import app from "./app.js";
import chalk from "chalk";
import { connectToMongoDB } from './database/mongodb.js';
import { PORT } from './configs/constant.js';

const startServer = async () => {
  try {
    await connectToMongoDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(chalk.green('Server running on ') + chalk.yellow(`http://localhost:${PORT}`));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
