import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import { getAllAppointments } from "../controllers/appointmentControllers.js";

const router = express.Router();

// Ruter for appointments (admin)
router.get("/", authMiddleware, adminMiddleware, getAllAppointments); // Se alle bestilte timer

export default router;
