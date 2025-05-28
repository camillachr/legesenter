import express from "express";
import {
  registerUser,
  userLogin,
  userLogout,
} from "../controllers/authControllers.js";

const router = express.Router();

// Ruter for autentisering
router
  .post("/register", registerUser) // Registrer bruker
  .post("/login", userLogin) // Logg inn
  .post("/logout", userLogout); // Logg ut

export default router;
