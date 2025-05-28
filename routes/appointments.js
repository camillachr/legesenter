import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import validateAppointmentOwnership from "../middleware/validateAppointmentOwnership.js";
import {
  getAvailableAppointments,
  scheduleNewAppointment,
  getUserAppointments,
  changeAppointmentTimeAndDate,
  cancelAppointment,
} from "../controllers/appointmentControllers.js";

const router = express.Router();

// Ruter for appointments (bruker)
router
  .get("/", authMiddleware, getAvailableAppointments) // Se tilgjengelige timer
  .get("/my", authMiddleware, getUserAppointments) // Se mine timer
  .post("/", authMiddleware, scheduleNewAppointment) // Bestill time
  .put(
    "/:appointmentId",
    authMiddleware,
    validateAppointmentOwnership,
    changeAppointmentTimeAndDate
  ) // Endre tidspunkt for time
  .delete(
    "/:appointmentId",
    authMiddleware,
    validateAppointmentOwnership,
    cancelAppointment
  ); // Slett time

export default router;
