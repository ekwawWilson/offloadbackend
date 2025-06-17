"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSupplierItemsWithSales = exports.getSupplierslist = exports.deleteSupplierItem = exports.updateSupplierItem = exports.getSupplierItems = exports.addMultipleSupplierItems = exports.addSupplierItem = exports.deleteSupplier = exports.updateSupplier = exports.getSupplierById = exports.getSuppliers = exports.createSupplier = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// ------------------------------
// SUPPLIERS
// ------------------------------
const createSupplier = async (req, res) => {
    try {
        const { suppliername, contact, country } = req.body;
        const companyId = req.user?.companyId;
        if (!companyId) {
            res.status(400).json({ error: "Company ID is missing" });
            return;
        }
        if (!suppliername || !contact || !country) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const supplier = await prisma_1.default.supplier.create({
            data: { suppliername, contact, country, companyId },
        });
        res.status(201).json(supplier);
    }
    catch (err) {
        console.error("Failed to create supplier:", err);
        res.status(400).json({ error: "Failed to create supplier", detail: err });
    }
};
exports.createSupplier = createSupplier;
const getSuppliers = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            res.status(400).json({ error: "Company ID is missing" });
            return;
        }
        const suppliers = await prisma_1.default.supplier.findMany({
            where: { companyId },
            include: { items: true },
        });
        res.json(suppliers);
    }
    catch (err) {
        console.error("Failed to fetch suppliers:", err);
        res.status(500).json({ error: "Failed to load suppliers" });
    }
};
exports.getSuppliers = getSuppliers;
const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const supplier = await prisma_1.default.supplier.findFirst({
            where: { id, companyId },
            include: { items: true },
        });
        if (!supplier) {
            res.status(404).json({ error: "Supplier not found" });
            return;
        }
        res.json(supplier);
    }
    catch (err) {
        console.error("Failed to fetch supplier:", err);
        res.status(500).json({ error: "Failed to load supplier" });
    }
};
exports.getSupplierById = getSupplierById;
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { suppliername, contact, country } = req.body;
        const supplier = await prisma_1.default.supplier.update({
            where: { id },
            data: { suppliername, contact, country },
        });
        res.json(supplier);
    }
    catch (err) {
        console.error("Failed to update supplier:", err);
        res.status(400).json({ error: "Failed to update supplier", detail: err });
    }
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.supplier.delete({ where: { id } });
        res.json({ message: "Supplier deleted" });
    }
    catch (err) {
        console.error("Failed to delete supplier:", err);
        res.status(400).json({ error: "Failed to delete supplier", detail: err });
    }
};
exports.deleteSupplier = deleteSupplier;
// ------------------------------
// SUPPLIER ITEMS
// ------------------------------
const addSupplierItem = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { itemName, price } = req.body;
        const item = await prisma_1.default.supplierItem.create({
            data: {
                supplierId,
                itemName,
                price,
            },
        });
        res.status(201).json(item);
    }
    catch (err) {
        console.error("Failed to add supplier item:", err);
        res.status(400).json({ error: "Failed to add supplier item", detail: err });
    }
};
exports.addSupplierItem = addSupplierItem;
const addMultipleSupplierItems = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { items } = req.body; // [{ itemName, price }, ...]
        const created = await prisma_1.default.supplierItem.createMany({
            data: items.map((item) => ({ ...item, supplierId })),
        });
        res.status(201).json({ count: created.count });
    }
    catch (err) {
        console.error("Failed to add multiple supplier items:", err);
        res.status(400).json({ error: "Failed to add items", detail: err });
    }
};
exports.addMultipleSupplierItems = addMultipleSupplierItems;
const getSupplierItems = async (req, res) => {
    try {
        const { id: supplierId } = req.params;
        const companyId = req.user?.companyId;
        const supplier = await prisma_1.default.supplier.findFirst({
            where: { id: supplierId, companyId },
        });
        if (!supplier) {
            res.status(404).json({ error: "Supplier not found" });
            return;
        }
        const items = await prisma_1.default.supplierItem.findMany({
            where: { supplierId },
            select: {
                id: true,
                itemName: true,
                price: true,
            },
            orderBy: { itemName: "asc" },
        });
        res.json(items);
    }
    catch (err) {
        console.error("Error fetching supplier items:", err);
        res.status(500).json({ error: "Failed to fetch supplier items" });
    }
};
exports.getSupplierItems = getSupplierItems;
const updateSupplierItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemName, price } = req.body;
        const item = await prisma_1.default.supplierItem.update({
            where: { id },
            data: { itemName, price },
        });
        res.json(item);
    }
    catch (err) {
        console.error("Failed to update supplier item:", err);
        res.status(400).json({ error: "Failed to update item", detail: err });
    }
};
exports.updateSupplierItem = updateSupplierItem;
const deleteSupplierItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.supplierItem.delete({ where: { id } });
        res.json({ message: "Item deleted" });
    }
    catch (err) {
        console.error("Failed to delete supplier item:", err);
        res.status(400).json({ error: "Failed to delete item", detail: err });
    }
};
exports.deleteSupplierItem = deleteSupplierItem;
const getSupplierslist = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            res.status(400).json({ error: "Company ID is missing" });
            return;
        }
        const suppliers = await prisma_1.default.supplier.findMany({
            where: { companyId },
            orderBy: { suppliername: "asc" },
        });
        res.json(suppliers);
    }
    catch (err) {
        console.error("Failed to fetch suppliers:", err);
        res.status(500).json({ error: "Failed to load suppliers" });
    }
};
exports.getSupplierslist = getSupplierslist;
const listSupplierItemsWithSales = async (req, res) => {
    try {
        // Step 1: Fetch all supplier items with supplier info
        const supplierItems = await prisma_1.default.supplierItem.findMany({
            include: {
                supplier: true,
            },
        });
        // Step 2: For each supplier item, find container items and aggregate quantities and sales
        const result = [];
        for (const sItem of supplierItems) {
            const { itemName, supplier, price } = sItem;
            const supplierName = supplier?.suppliername || "Unknown";
            const supplierId = supplier?.id;
            // Step 3: Get all container items that match the item name and supplier
            const containerItems = await prisma_1.default.containerItem.findMany({
                where: {
                    itemName,
                    container: {
                        supplierId,
                    },
                },
                include: {
                    container: true,
                },
            });
            let totalQty = 0;
            let soldQty = 0;
            for (const cItem of containerItems) {
                totalQty += cItem.quantity;
                // Aggregate sold quantity from sale items
                const sales = await prisma_1.default.saleItem.aggregate({
                    _sum: {
                        quantity: true,
                    },
                    where: {
                        itemName: cItem.itemName,
                        sale: {
                            sourceType: "container",
                            sourceId: cItem.containerId,
                            companyId: cItem.container.companyId,
                        },
                    },
                });
                soldQty += sales._sum.quantity || 0;
            }
            result.push({
                itemName,
                supplierName,
                quantity: totalQty,
                soldQty,
                remainingQty: totalQty - soldQty,
                price,
            });
        }
        res.json(result);
        return;
    }
    catch (error) {
        console.error("Error fetching supplier item sales summary:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};
exports.listSupplierItemsWithSales = listSupplierItemsWithSales;
