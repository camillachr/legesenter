import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addNewDoctor,
  deleteDoctor,
  getAllDoctors,
  updateDoctorInfo,
} from "../controllers/doctorsControllers.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Ruter for doctors
router
  .get("/", authMiddleware, adminMiddleware, getAllDoctors) // Hent alle leger
  .post("/", authMiddleware, adminMiddleware, addNewDoctor) // Legg til lege
  .put("/:doctorId", authMiddleware, adminMiddleware, updateDoctorInfo) // Oppdater lege
  .delete("/:doctorId", authMiddleware, adminMiddleware, deleteDoctor); // Slett lege

export default router;
