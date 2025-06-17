"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const container_routes_1 = __importDefault(require("./routes/container.routes"));
const offloading_routes_1 = __importDefault(require("./routes/offloading.routes"));
const sale_routes_1 = __importDefault(require("./routes/sale.routes"));
const customerPayment_routes_1 = __importDefault(require("./routes/customerPayment.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middlewares
app.use((0, cors_1.default)({
    origin: "*", // or restrict to specific frontend origins
}));
app.use(express_1.default.json());
// Swagger setup
const swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Offloading App API",
            version: "1.0.0",
            description: "API docs for OffloadTracker system",
        },
        servers: [
            {
                url: process.env.SWAGGER_SERVER_URL || "http://localhost:4000/api", // ✅ base path for all routes
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
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/companies", company_routes_1.default);
app.use("/api/customers", customer_routes_1.default);
app.use("/api/suppliers", supplier_routes_1.default);
app.use("/api/containers", container_routes_1.default);
app.use("/api/offloading", offloading_routes_1.default);
app.use("/api/sales", sale_routes_1.default);
app.use("/api/payments", customerPayment_routes_1.default);
app.use("/api/reports", report_routes_1.default);
app.use("/api/inventory", inventory_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/audit", audit_routes_1.default);
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
