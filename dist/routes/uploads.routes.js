"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_controller_1 = require("../controllers/upload.controller");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post("/container/:id/items", upload.single("file"), upload_controller_1.uploadContainerItems);
router.post("/supplier/:id/items", upload.single("file"), upload_controller_1.uploadSupplierItems);
exports.default = router;
