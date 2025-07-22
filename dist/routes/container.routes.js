"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_controller_1 = require("../controllers/container.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @openapi
 * /containers:
 *   get:
 *     tags:
 *       - Containers
 *     summary: Get paginated list of containers with optional search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (5 items per page)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter by container number or supplier name
 *     responses:
 *       200:
 *         description: A paginated list of containers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       containerNo:
 *                         type: string
 *                       arrivalDate:
 *                         type: string
 *                         format: date-time
 *                       year:
 *                         type: integer
 *                       supplier:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           suppliername:
 *                             type: string
 *                           country:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                       example: 5
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Missing or invalid company ID
 *       500:
 *         description: Internal server error
 */
router.get("/", container_controller_1.getContainers);
/**
 * @openapi
 * /containers:
 *   post:
 *     tags:
 *       - Containers
 *     summary: Create a new container with items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - containerNo
 *               - arrivalDate
 *               - year
 *               - supplierId
 *               - items
 *             properties:
 *               containerNo:
 *                 type: string
 *               arrivalDate:
 *                 type: string
 *                 format: date
 *               year:
 *                 type: integer
 *               supplierId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemName
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     itemName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Container created
 */
router.post("/", container_controller_1.createContainer);
/**
 * @openapi
 * /containers/{id}:
 *   get:
 *     tags:
 *       - Containers
 *     summary: Get container details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container details
 *       404:
 *         description: Container not found
 */
router.get("/:id", container_controller_1.getContainerById);
/**
 * @openapi
 * /containers/{id}/mark-received:
 *   put:
 *     tags:
 *       - Containers
 *     summary: Mark a container as received
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container marked as received
 */
router.put("/:id/mark-received", container_controller_1.markContainerAsReceived);
/**
 * @openapi
 * /containers/{id}/mark-incomplete:
 *   put:
 *     tags:
 *       - Containers
 *     summary: Mark container as offload incomplete
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container marked as offload incomplete
 */
router.put("/:id/mark-incomplete", container_controller_1.markContainerAsIncomplete);
/**
 * @openapi
 * /containers/{id}/mark-done:
 *   put:
 *     tags:
 *       - Containers
 *     summary: Mark container as offload done
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container marked as offload done
 */
router.put("/:id/mark-done", container_controller_1.markContainerAsDone);
router.delete("/:id", container_controller_1.deleteContainer);
router.put("/:id/update-quantities", container_controller_1.updateReceivedQuantities);
router.post("/:id/offload", container_controller_1.completeOffload);
router.post("/offload", container_controller_1.saveOffloadData);
/**
 * @swagger
 * /containers/{id}/items:
 *   get:
 *     summary: Get all items for a specific container
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the container
 *     responses:
 *       200:
 *         description: List of container items
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
 *                   quantity:
 *                     type: number
 *                   receivedQty:
 *                     type: number
 *                   unitPrice:
 *                     type: number
 *       404:
 *         description: Container not found
 *       500:
 *         description: Server error
 */
// GET /api/containers/:id/items
router.get("/:id/items", container_controller_1.getContainerItems);
/**
 * @swagger
 * /containers/{id}/summary:
 *   get:
 *     summary: Get offload summary for a container
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Container ID
 *     responses:
 *       200:
 *         description: A list of container item summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "abc123"
 *                   name:
 *                     type: string
 *                     example: "Laptops"
 *                   expected:
 *                     type: number
 *                     example: 10
 *                   received:
 *                     type: number
 *                     example: 9
 *       404:
 *         description: Container not found
 *       500:
 *         description: Server error
 */
router.get("/:id/summary", container_controller_1.getOffloadSummary); // Add this route
/**
 * @swagger
 * /containers/{id}/containeritems/withsales:
 *   get:
 *     summary: List container items with sales breakdown for a container
 *     tags:
 *       - ContainerItems
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the container
 *     responses:
 *       200:
 *         description: List of container items with their received, sold, and remaining quantities
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
 *                   receivedQty:
 *                     type: number
 *                   soldQty:
 *                     type: number
 *                   remainingQty:
 *                     type: number
 *                   unitPrice:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
router.get("/:id/containeritems/withsales", container_controller_1.listContainerItemsWithSales);
router.get("/:id/containersummary", container_controller_1.getContainerSalesSummary);
exports.default = router;
