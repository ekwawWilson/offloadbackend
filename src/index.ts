import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import customerRoutes from "./routes/customer.routes";
import supplierRoutes from "./routes/supplier.routes";
import containerRoutes from "./routes/container.routes";
import offloadingRoutes from "./routes/offloading.routes";
import saleRoutes from "./routes/sale.routes";
import customerPaymentRoutes from "./routes/customerPayment.routes";
import inventoryRoutes from "./routes/inventory.routes";
import userRoutes from "./routes/user.routes";
import auditRoutes from "./routes/audit.routes";
import reportRoutes from "./routes/report.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Offloading App API",
      version: "1.0.0",
      description: "API docs for OffloadTracker system",
    },
    servers: [
      {
        url: "https://offloadbackend.onrender.com/api", // ✅ base path for all routes
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/**/*.ts", "./src/controllers/**/*.ts"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/offloading", offloadingRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/payments", customerPaymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit", auditRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
