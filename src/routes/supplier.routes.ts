import { Router } from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  addSupplierItem,
  getSupplierItems,
  updateSupplierItem,
  deleteSupplierItem,
  getSupplierslist,
  listSupplierItemsWithSales,
} from "../controllers/supplier.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /suppliers:
 *   post:
 *     tags: [Suppliers]
 *     summary: Create a new supplier
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [name, contact, country, companyid]
 *             properties:
 *               suppliername:
 *                 type: string
 *               contact:
 *                 type: string
 *               country:
 *                 type: string
 *               companyid:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created
 */
router.post("/", authenticate, createSupplier);

/**
 * @openapi
 * /suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: List all suppliers for the logged-in user's company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suppliers
 */
router.get("/suppliers", authenticate, getSuppliers);

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get supplier by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Supplier details
 */
router.get("/:id", getSupplierById);

/**
 * @openapi
 * /suppliers/{id}:
 *   put:
 *     tags: [Suppliers]
 *     summary: Update a supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name: { type: string }
 *               contact: { type: string }
 *               country: { type: string }
 *     responses:
 *       200:
 *         description: Supplier updated
 */
router.put("/:id", updateSupplier);

/**
 * @openapi
 * /suppliers/{id}:
 *   delete:
 *     tags: [Suppliers]
 *     summary: Delete a supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Supplier deleted
 */
router.delete("/:id", deleteSupplier);

/**
 * @openapi
 * /suppliers/{supplierId}/items:
 *   post:
 *     tags: [Supplier Items]
 *     summary: Add a new item to a supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: supplierId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             required: [itemName, price]
 *             properties:
 *               itemName: { type: string }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Item added
 */
router.post("/:supplierId/items", authenticate, addSupplierItem);

/**
 * @openapi
 * /api/suppliers/{id}/items:
 *   get:
 *     tags:
 *       - Suppliers
 *     summary: Get items belonging to a specific supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: List of supplier items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   itemName:
 *                     type: string
 *                   price:
 *                     type: number
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 */

router.get("/:id/items", getSupplierItems);

/**
 * @openapi
 * /suppliers/items/{id}:
 *   put:
 *     tags: [Supplier Items]
 *     summary: Update a supplier item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               itemName: { type: string }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Item updated
 */
router.put("/items/:id", authenticate, updateSupplierItem);

/**
 * @openapi
 * /suppliers/items/{id}:
 *   delete:
 *     tags: [Supplier Items]
 *     summary: Delete a supplier item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item deleted
 */
router.delete("/items/:id", deleteSupplierItem);

/**
 * @openapi
 * /suppliers/list:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get full supplier list for the logged-in user's company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Raw list of suppliers
 */
router.get("/list", getSupplierslist); //

router.get("/items/withsales", listSupplierItemsWithSales);

export default router;
