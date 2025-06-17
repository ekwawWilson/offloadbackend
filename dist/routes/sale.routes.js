"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sale_controller_1 = require("../controllers/sale.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authoriseRole_1 = require("../middlewares/authoriseRole");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @openapi
 * /sales:
 *   post:
 *     tags:
 *       - Sales
 *     summary: Record a new sale
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               saleType:
 *                 type: string
 *                 enum: [cash, credit]
 *     responses:
 *       201:
 *         description: Sale recorded
 */
router.post("/", (0, authoriseRole_1.authorizeRoles)("admin", "staff"), sale_controller_1.recordSale);
router.get("/", sale_controller_1.getSales);
router.get("/:id/items", sale_controller_1.getContainerItemsBySupplier);
router.get("/customer/:id", sale_controller_1.getSalesByCustomerId);
router.get("/:id", sale_controller_1.getSaleById);
router.put("/:id", sale_controller_1.updateSale);
router.put("/:id/total", sale_controller_1.updateSaleTotalAmount);
exports.default = router;
