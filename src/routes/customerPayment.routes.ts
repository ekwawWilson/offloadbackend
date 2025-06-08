import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  recordCustomerPayment,
  getCustomerStatement,
} from "../controllers/customerPayment.controller";

const router = Router();
router.use(authenticate);

router.post("/", recordCustomerPayment);
router.get("/:id/statement", getCustomerStatement);

export default router;
