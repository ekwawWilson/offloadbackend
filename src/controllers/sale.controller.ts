import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const recordSale = async (req: Request, res: Response) => {
  const { saleType, sourceType, sourceId, customerId, items, saleDate } = req.body;
  const companyId = req.user?.companyId;
  if (!companyId) {
    res.status(400).json({ error: "Company ID missing" });
    return;
  }
  const totalAmount = items.reduce(
    (sum: number, i: any) => sum + i.unitPrice * i.quantity,
    0
  );

  try {
    // Parse sale date if provided, otherwise use current date
    const parsedSaleDate = saleDate ? new Date(saleDate) : new Date();
    
    console.log('Recording sale with date:', {
      originalSaleDate: saleDate,
      parsedSaleDate,
      customerId,
      totalAmount,
      itemsCount: items?.length
    });
    
    const sale = await prisma.sale.create({
      data: {
        saleType,
        sourceType,
        sourceId,
        customerId,
        companyId,
        totalAmount,
        createdAt: parsedSaleDate, // Use custom sale date
        items: {
          createMany: {
            data: items.map((i: any) => ({
              itemName: i.itemName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
      },
    });
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: "Failed to record sale", detail: err });
    console.log(err);
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(400).json({ error: "Company ID missing" });
      return;
    }
    
    const { startDate, endDate } = req.query;
    
    console.log('getSales - Date filtering parameters:', { startDate, endDate, companyId });

    const whereClause: any = {
      companyId,
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      
      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({ error: "Invalid start date format" });
          return;
        }
        start.setHours(0, 0, 0, 0); // include entire start day
        whereClause.createdAt.gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({ error: "Invalid end date format" });
          return;
        }
        end.setHours(23, 59, 59, 999); // include entire end day
        whereClause.createdAt.lte = end;
      }
      
      // Validate date range
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (start > end) {
          res.status(400).json({ error: "Start date cannot be after end date" });
          return;
        }
      }
    }

    console.log('getSales - Final where clause:', JSON.stringify(whereClause, null, 2));
    
    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
    
    console.log(`getSales - Found ${sales.length} sales matching criteria`);

    const response = sales.map((sale) => ({
      id: sale.id,
      saleType: sale.saleType,
      sourceType: sale.sourceType,
      customer: {
        customerName: sale.customer.customerName,
      },
      totalAmount: sale.totalAmount,
      createdAt: sale.createdAt,
      items: sale.items.map((i) => ({
        itemName: i.itemName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }));

    res.json(response);
  } catch (error) {
    console.error("Failed to get sales", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getContainerItemsBySupplier = async (
  req: Request,
  res: Response
) => {
  const { id: supplierId } = req.params;

  if (!supplierId) {
    res.status(400).json({ error: "Supplier ID is required" });
    return;
  }

  try {
    const containers = await prisma.container.findMany({
      where: { supplierId },
      include: {
        items: true,
      },
    });

    const allItems = containers.flatMap((c) =>
      c.items.map((i) => ({
        id: i.id,
        itemName: i.itemName,
        available: i.quantity - i.soldQty,
        unitPrice: i.unitPrice,
        containerId: c.id,
        containerNo: c.containerNo,
      }))
    );

    res.json(allItems);
    return;
  } catch (error) {
    console.error("Error fetching container items:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
// controller/sales.controller.ts
export const getSalesByCustomerId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sales = await prisma.sale.findMany({
      where: { customerId: id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales by customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get a specific sale by ID
export const getSaleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!sale) {
      res.status(404).json({ error: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update sale and items
export const updateSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { saleType, items } = req.body;

  try {
    await prisma.sale.update({
      where: { id },
      data: {
        saleType,
        items: {
          deleteMany: {},
          createMany: {
            data: items.map((item: any) => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      },
    });

    res.json({ message: "Sale updated successfully" });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateSaleTotalAmount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { totalAmount } = req.body;

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: { totalAmount },
    });

    res.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /sales
export const listSales = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(400).json({ error: "Company ID missing" });
      return;
    }
    
    const { startDate, endDate } = req.query;
    
    console.log('Date filtering parameters:', { startDate, endDate, companyId });

    const whereClause: any = {
      companyId,
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      
      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({ error: "Invalid start date format" });
          return;
        }
        start.setHours(0, 0, 0, 0); // include entire start day
        whereClause.createdAt.gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({ error: "Invalid end date format" });
          return;
        }
        end.setHours(23, 59, 59, 999); // include entire end day
        whereClause.createdAt.lte = end;
      }
      
      // Validate date range
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (start > end) {
          res.status(400).json({ error: "Start date cannot be after end date" });
          return;
        }
      }
    }

    console.log('Final where clause:', JSON.stringify(whereClause, null, 2));
    
    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
    
    console.log(`Found ${sales.length} sales matching criteria`);

    const response = sales.map((sale) => ({
      id: sale.id,
      saleType: sale.saleType,
      sourceType: sale.sourceType,
      customer: {
        customerName: sale.customer.customerName,
      },
      totalAmount: sale.totalAmount,
      createdAt: sale.createdAt,
      items: sale.items.map((i) => ({
        itemName: i.itemName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }));

    res.json(response);
  } catch (error) {
    console.error("Failed to list sales", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE /sales/:id
export const deleteSaleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const companyId = req.user?.companyId;

  try {
    // Optional: validate ownership
    const sale = await prisma.sale.findUnique({
      where: { id },
    });

    if (!sale || sale.companyId !== companyId) {
      res.status(404).json({ error: "Sale not found" });
      return;
    }

    // Delete related sale items first
    await prisma.saleItem.deleteMany({
      where: { saleId: id },
    });

    // Then delete the sale
    await prisma.sale.delete({
      where: { id },
    });

    res.json({ message: "Sale deleted successfully." });
  } catch (error) {
    console.error("Failed to delete sale", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
