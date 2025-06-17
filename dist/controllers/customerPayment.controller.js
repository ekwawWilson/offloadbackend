"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerStatement = exports.recordCustomerPayment = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const recordCustomerPayment = async (req, res) => {
    const { customerId, amount, note } = req.body;
    const companyId = req.user?.companyId;
    if (!companyId) {
        res.status(400).json({ error: "Company ID missing" });
        return;
    }
    try {
        const payment = await prisma_1.default.customerPayment.create({
            data: { customerId, amount, note, companyId },
        });
        res.status(201).json(payment);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to record payment", detail: err });
    }
};
exports.recordCustomerPayment = recordCustomerPayment;
const getCustomerStatement = async (req, res) => {
    const { id } = req.params; // customerId
    const sales = await prisma_1.default.sale.findMany({
        where: { customerId: id },
        select: {
            createdAt: true,
            totalAmount: true,
            saleType: true,
            id: true,
        },
    });
    const payments = await prisma_1.default.customerPayment.findMany({
        where: { customerId: id },
        select: {
            createdAt: true,
            amount: true,
            note: true,
            id: true,
        },
    });
    // Merge & sort by date
    const timeline = [
        ...sales.map((s) => ({
            type: "sale",
            date: s.createdAt,
            amount: s.totalAmount,
            detail: `Sale (${s.saleType})`,
        })),
        ...payments.map((p) => ({
            type: "payment",
            date: p.createdAt,
            amount: p.amount,
            detail: `Payment${p.note ? ` - ${p.note}` : ""}`,
        })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    // Running balance
    let balance = 0;
    const statement = timeline.map((t) => {
        balance += t.type === "sale" ? t.amount : -t.amount;
        return { ...t, balance };
    });
    res.json(statement);
};
exports.getCustomerStatement = getCustomerStatement;
