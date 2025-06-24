import { Request, Response } from "express";
import { parseExcel } from "../utils/excelParser";
import prisma from "../utils/prisma";
import * as XLSX from "xlsx";
import { Customer, CustomerPayment } from "@prisma/client";

// 🧾 Upload to Container (with optional preview)
export const uploadContainerItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const containerId = req.params.id;
  const previewMode = req.query.preview === "true";

  if (!req.file) {
    res.status(400).json({ error: "Excel file is required" });
    return;
  }

  const items = parseExcel(req.file.buffer);

  const errors = items.filter(
    (item) => !item.itemName || !item.quantity || item.quantity <= 0
  );
  if (errors.length > 0) {
    res.status(400).json({ error: "Validation failed", invalidItems: errors });
    return;
  }

  if (previewMode) {
    res.json({ preview: true, items });
    return;
  }

  try {
    await prisma.containerItem.createMany({
      data: items.map((item) => ({
        containerId,
        itemName: item.itemName,
        quantity: item.quantity,
        receivedQty: 0,
        unitPrice: 0,
      })),
    });
    res.status(201).json({ message: "Items uploaded", items });
  } catch (err) {
    res.status(500).json({ error: "Failed to save items", detail: err });
  }
};

// 🧾 Upload to Supplier (adds items to SupplierItem)
export const uploadSupplierItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const supplierId = req.params.id;

  if (!req.file) {
    res.status(400).json({ error: "Excel file is required" });
    return;
  }

  const items = parseExcel(req.file.buffer);
  const validItems = items.filter(
    (item) => item.itemName && item.quantity && item.quantity > 0
  );

  try {
    await prisma.supplierItem.createMany({
      data: validItems.map((item) => ({
        supplierId,
        itemName: item.itemName,
        price: item.quantity, // reuse Quantity column as Price for suppliers
      })),
    });
    res
      .status(201)
      .json({ message: "Supplier items uploaded", items: validItems });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save supplier items", detail: err });
  }
};
export const uploadOpeningBalances = async (req: Request, res: Response) => {
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
    type OpeningBalanceRow = {
      CustomerName: string;
      Phone: string;
      Amount: number;
    };
    const rows = XLSX.utils.sheet_to_json<OpeningBalanceRow>(sheet);

    for (const row of rows) {
      const name = row.CustomerName?.toString()?.trim();
      const phone = row.Phone?.toString()?.trim();
      const amount = parseFloat(row.Amount?.toString() ?? "");

      if (!name || !phone || isNaN(amount)) continue;

      // Check if customer exists
      let customer: Customer | null = await prisma.customer.findFirst({
        where: { customerName: name, phone, companyId },
      });

      // Create if not found
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            customerName: name,
            phone,
            companyId,
          },
        });
      }

      // Check if opening balance already exists
      const existingPayment: CustomerPayment | null =
        await prisma.customerPayment.findFirst({
          where: {
            customerId: customer.id,
            note: "Opening balance",
          },
        });

      if (existingPayment) {
        // Update the amount
        await prisma.customerPayment.update({
          where: { id: existingPayment.id },
          data: { amount },
        });
      } else {
        // Create new opening balance
        await prisma.customerPayment.create({
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
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed." });
    return;
  }
};
