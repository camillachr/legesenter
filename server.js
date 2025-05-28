import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import adminAppointmentRoutes from "./routes/adminAppointments.js";
import createAdminUser from "./utils/createAdmin.js";
import * as setupAppointments from "./utils/setupAppointments.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Ruter for brukere
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

// Ruter for admin
app.use("/api/admin/doctors", doctorRoutes);
app.use("/api/admin/appointments", adminAppointmentRoutes);

// Start server
const startServer = async () => {
  try {
    // Generer alle lediige avtaletimer ved oppstart
    await setupAppointments.setupAppointmentsForAllDoctors();

    // Setter opp en adminbruker
    createAdminUser();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Feil ved oppstart av server:", error);
  }
};

startServer();
