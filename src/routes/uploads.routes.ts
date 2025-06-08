import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";
import {
  uploadContainerItems,
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

export default router;
