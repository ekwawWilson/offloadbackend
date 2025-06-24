import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";
import {
  uploadContainerItems,
  uploadOpeningBalances,
  uploadSupplierItems,
} from "../controllers/upload.controller";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.use(authenticate);

router.post(
  "/container/:id/items",
  upload.single("file"),
  uploadContainerItems
);
router.post("/supplier/:id/items", upload.single("file"), uploadSupplierItems);

/**
 * @swagger
 * /uploads/uploadopeningbalances:
 *   post:
 *     summary: Upload customer opening balances from Excel file
 *     tags:
 *       - Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx or .csv) containing customer name, phone, and amount
 *     responses:
 *       200:
 *         description: Opening balances processed successfully
 *       400:
 *         description: Validation error or missing data
 *       500:
 *         description: Internal server error
 */
router.post(
  "/uploadopeningbalances",
  upload.single("file"),
  uploadOpeningBalances
);

export default router;
