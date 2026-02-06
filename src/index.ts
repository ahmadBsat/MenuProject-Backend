import * as dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.2,
});

import http from "http";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import "./config/database";
import logger from "morgan";
import router from "./routes";
import { Logger } from "./entities/logger";

const app = express();
const origin = function (
  origin: string,
  callback: (err: Error, origin?: any) => void
) {
  callback(null, true);
};

app.use(
  cors({
    origin: origin,
    methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    credentials: true,
    exposedHeaders: ["x-agent-token", "x-session-id"],
  })
);

app.use(
  compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.set("trust proxy", 1);

const server = http.createServer(app);

// Use combined format for production with more details
const logFormat = process.env.NODE_ENV === "production"
  ? ":method :url :status :response-time ms - :res[content-length] - :remote-addr - :user-agent"
  : "dev";
app.use(logger(logFormat));
app.use("/", router());

// 404 handler with detailed logging
app.use((req, res) => {
  Logger.warn(
    `404 Not Found: ${req.method} ${req.url} | Query: ${JSON.stringify(req.query)} | Headers: ${JSON.stringify(req.headers)} | IP: ${req.ip}`
  );
  res.status(404).json({ message: "Route not found" });
});

Sentry.setupExpressErrorHandler(app);

const shutdown = async () => {
  Logger.info("Shutting down gracefully...");

  try {
    const close_server = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          Logger.info("Server closed.");
          resolve();
        });
      });
    };

    // gracefully shut down server
    await close_server();

    Logger.info("Graceful shutdown complete. Exiting...");
    process.exit(0);
  } catch (err) {
    Logger.error(`Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(8080, () => {
  Logger.info("server running");
  Logger.info(`worker pid: ${process.pid}`);
});
