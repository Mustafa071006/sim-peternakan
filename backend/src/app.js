import express from "express";
import cors from "cors";
import morgan from "morgan";

import { swaggerUi, swaggerSpec } from "./docs/swagger.js";

// ==============================
// Routes
// ==============================
import authRoutes         from "./routes/authRoutes.js";
import kandangRoutes      from "./routes/kandangRoutes.js";
import strainRoutes       from "./routes/strainRoutes.js";
import jenisPakanRoutes   from "./routes/jenisPakanRoutes.js";
import vaksinRoutes       from "./routes/vaksinRoutes.js";
import userRoutes         from "./routes/userRoutes.js";
import periodeRoutes      from "./routes/periodeRoutes.js";
import feedRoutes         from "./routes/feedRoutes.js";
import produksiRoutes     from "./routes/produksiRoutes.js";
import mortalitasRoutes   from "./routes/mortalitasRoutes.js";
import vaksinasiRoutes    from "./routes/vaksinasiRoutes.js";
import dashboardRoutes    from "./routes/dashboardRoutes.js";
import reportRoutes       from "./routes/reportRoutes.js";
import analyticsRoutes    from "./routes/analyticsRoutes.js";
import standarStrainRoutes from "./routes/standarStrainRoutes.js";
import healthRoutes       from "./routes/healthRoutes.js";

// ==============================
// Middleware
// ==============================
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ==============================
// GLOBAL MIDDLEWARE
// ==============================
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ==============================
// ROOT ENDPOINT
// ==============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API SIM Peternakan berjalan.",
  });
});

// ==============================
// SWAGGER (hanya 1x)
// ==============================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==============================
// API ROUTES (masing-masing hanya 1x)
// ==============================
app.use("/api/auth",          authRoutes);
app.use("/api/kandang",       kandangRoutes);
app.use("/api/strain",        strainRoutes);
app.use("/api/jenis-pakan",   jenisPakanRoutes);
app.use("/api/vaksin",        vaksinRoutes);
app.use("/api/user",          userRoutes);
app.use("/api/periode",       periodeRoutes);
app.use("/api/feed",          feedRoutes);
app.use("/api/produksi",      produksiRoutes);
app.use("/api/mortalitas",    mortalitasRoutes);
app.use("/api/vaksinasi",     vaksinasiRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/report",        reportRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/standar-strain", standarStrainRoutes);
app.use("/api/health",        healthRoutes);

// ==============================
// 404 Not Found
// ==============================
app.use((req, res, next) => {
  const err = new Error("Endpoint tidak ditemukan.");
  err.statusCode = 404;
  next(err);
});

// ==============================
// Error Handler
// ==============================
app.use(errorHandler);

export default app;