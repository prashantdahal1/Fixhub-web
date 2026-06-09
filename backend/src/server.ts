import app from "./app";
import chalk from "chalk";
import { connectToMongoDB } from "./database/mongodb";
import { PORT } from "./configs/constant";

const startServer = async () => {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(chalk.green('Server running on ') + chalk.yellow(`http://localhost:${PORT}`));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
