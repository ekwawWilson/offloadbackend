"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOpeningBalances = exports.uploadSupplierItems = exports.uploadContainerItems = void 0;
const excelParser_1 = require("../utils/excelParser");
const prisma_1 = __importDefault(require("../utils/prisma"));
const XLSX = __importStar(require("xlsx"));
// 🧾 Upload to Container (with optional preview)
const uploadContainerItems = async (req, res) => {
    const containerId = req.params.id;
    const previewMode = req.query.preview === "true";
    if (!req.file) {
        res.status(400).json({ error: "Excel file is required" });
        return;
    }
    const items = (0, excelParser_1.parseExcel)(req.file.buffer);
    const errors = items.filter((item) => !item.itemName || !item.quantity || item.quantity <= 0);
    if (errors.length > 0) {
        res.status(400).json({ error: "Validation failed", invalidItems: errors });
        return;
    }
    if (previewMode) {
        res.json({ preview: true, items });
        return;
    }
    try {
        await prisma_1.default.containerItem.createMany({
            data: items.map((item) => ({
                containerId,
                itemName: item.itemName,
                quantity: item.quantity,
                receivedQty: 0,
                unitPrice: 0,
            })),
        });
        res.status(201).json({ message: "Items uploaded", items });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to save items", detail: err });
    }
};
exports.uploadContainerItems = uploadContainerItems;
// 🧾 Upload to Supplier (adds items to SupplierItem)
const uploadSupplierItems = async (req, res) => {
    const supplierId = req.params.id;
    if (!req.file) {
        res.status(400).json({ error: "Excel file is required" });
        return;
    }
    const items = (0, excelParser_1.parseExcel)(req.file.buffer);
    const validItems = items.filter((item) => item.itemName && item.quantity && item.quantity > 0);
    try {
        await prisma_1.default.supplierItem.createMany({
            data: validItems.map((item) => ({
                supplierId,
                itemName: item.itemName,
                price: item.quantity, // reuse Quantity column as Price for suppliers
            })),
        });
        res
            .status(201)
            .json({ message: "Supplier items uploaded", items: validItems });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to save supplier items", detail: err });
    }
};
exports.uploadSupplierItems = uploadSupplierItems;
const uploadOpeningBalances = async (req, res) => {
    try {
        const file = req.file; // uploaded file via multer
        const companyId = req.user?.companyId; // assuming you set this in auth middleware
        if (!file) {
            res.status(400).json({ error: "No file uploaded." });
            return;
        }
        if (!companyId) {
            res.status(400).json({ error: "Missing company context." });
            return;
        }
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
            const name = row.CustomerName?.toString()?.trim();
            const phone = row.Phone?.toString()?.trim();
            const amount = parseFloat(row.Amount?.toString() ?? "");
            if (!name || !phone || isNaN(amount))
                continue;
            // Check if customer exists
            let customer = await prisma_1.default.customer.findFirst({
                where: { customerName: name, phone, companyId },
            });
            // Create if not found
            if (!customer) {
                customer = await prisma_1.default.customer.create({
                    data: {
                        customerName: name,
                        phone,
                        companyId,
                    },
                });
            }
            // Check if opening balance already exists
            const existingPayment = await prisma_1.default.customerPayment.findFirst({
                where: {
                    customerId: customer.id,
                    note: "Opening balance",
                },
            });
            if (existingPayment) {
                // Update the amount
                await prisma_1.default.customerPayment.update({
                    where: { id: existingPayment.id },
                    data: { amount },
                });
            }
            else {
                // Create new opening balance
                await prisma_1.default.customerPayment.create({
                    data: {
                        customerId: customer.id,
                        amount,
                        note: "Opening balance",
                        companyId,
                    },
                });
            }
        }
        res.json({ message: "Opening balances uploaded successfully." });
        return;
    }
    catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ error: "Upload failed." });
        return;
    }
};
exports.uploadOpeningBalances = uploadOpeningBalances;
