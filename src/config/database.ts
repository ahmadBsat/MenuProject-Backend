import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { SilentException } from "../utils/sentry_logger";
import { Logger } from "../entities/logger";

dotenv.config();

(async function () {
  const retries = 5;
  const delay = 2000; // 2 seconds delay between retries
  let attempt = 0;

  const initialize_db_connection = async (): Promise<void> => {
    try {
      const options: mongoose.ConnectOptions = { dbName: "uraiagent" };
      mongoose.Promise = Promise;
      await mongoose.connect(process.env.MONGODB_URI, options);
      Logger.info("Connected to db");
    } catch (error) {
      attempt++;
      Logger.warn(`Connection attempt ${attempt} failed. Error: ${error}`);

      if (attempt < retries) {
        Logger.warn(`Retrying connection in ${delay / 1000} seconds...`);
        setTimeout(initialize_db_connection, delay); // Retry after delay
      } else {
        Logger.error("Max retries reached. Could not connect to MongoDB.");
      }
    }
  };

  initialize_db_connection();

  mongoose.connection.on("error", (error: Error) => {
    Logger.error(`MongoDB error: ${error}`);
    SilentException.captureException(error);
  });
})();
