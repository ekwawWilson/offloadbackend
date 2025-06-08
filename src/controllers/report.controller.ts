import { Request, Response } from "express";
import {
  getContainerReport as getContainerReportService,
  getSupplierReport,
  getDetailedSalesReport,
} from "../services/report.service";

export const getContainerReport = async (req: Request, res: Response) => {
  try {
    const report = await getContainerReportService(req.params.containerId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate container report" });
  }
};

export const supplierReport = async (req: Request, res: Response) => {
  try {
    const report = await getSupplierReport(req.params.supplierId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate supplier report" });
  }
};

export const detailedSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await getDetailedSalesReport(
      startDate as string,
      endDate as string
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate detailed report" });
  }
};
