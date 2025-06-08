import { Router } from "express";
import {
  recordSale,
  getSales,
  getContainerItemsBySupplier,
  getSaleById,
  updateSale,
  getSalesByCustomerId,
  updateSaleTotalAmount,
} from "../controllers/sale.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authoriseRole";

const router = Router();
router.use(authenticate);

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

router.post("/", authorizeRoles("admin", "staff"), recordSale);

router.get("/", getSales);

router.get("/:id/items", getContainerItemsBySupplier);

router.get("/customer/:id", getSalesByCustomerId);

router.get("/:id", getSaleById);

router.put("/:id", updateSale);

router.put("/:id/total", updateSaleTotalAmount);

export default router;
