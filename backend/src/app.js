import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import env from "./config/env.js";

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.frontendOrigin,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Running"
  });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
