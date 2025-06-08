import { Request, Response } from "express";
import { parseExcel } from "../utils/excelParser";
import prisma from "../utils/prisma";

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
