import db from "../config/db.js";
import {
  deleteOldSlots,
  generateNewSlots,
} from "../utils/setupAppointments.js";

// --------------- Hent alle leger ---------------//
export const getAllDoctors = async (req, res) => {
  try {
    const sql = "SELECT * FROM doctors";
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Feil ved henting av data" });
  }
};

// --------------- Legg til lege ---------------//
export const addNewDoctor = async (req, res) => {
  const {
    firstName,
    lastName,
    specialization,
    availabilityStart,
    availabilityEnd,
  } = req.body;

  try {
    const sql =
      "INSERT INTO doctors (first_name, last_name, specialization, availability_start, availability_end) VALUES (?, ?, ?, ?, ?)";
    const [{ insertId }] = await db.execute(sql, [
      firstName,
      lastName,
      specialization,
      availabilityStart,
      availabilityEnd,
    ]);

    res.status(200).json({
      id: insertId,
      firstName,
      lastName,
      specialization,
      availabilityStart,
      availabilityEnd,
    });

    // Hent oppdatert informasjon om legen
    const selectSql = "SELECT * FROM doctors WHERE id = ?";
    const [rows] = await db.execute(selectSql, [insertId]);
    const newDoctor = rows[0];

    // Generer ledige timeavtaler for den nye legen
    generateNewSlots(
      newDoctor.id,
      newDoctor.availability_start,
      newDoctor.availability_end
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Feil ved opprettelsen av data" });
  }
};

// --------------- Oppdater info om lege ---------------//
export const updateDoctorInfo = async (req, res) => {
  const { doctorId } = req.params;
  const {
    firstName,
    lastName,
    specialization,
    availabilityStart,
    availabilityEnd,
  } = req.body;

  if (!firstName || !lastName || !availabilityStart || !availabilityEnd) {
    return res.status(400).json({ error: "Manglende felter i forespørselen" });
  }

  try {
    // Sjekk om legen med den angitte ID-en finnes
    const checkSql = "SELECT * FROM doctors WHERE id = ?";
    const [doctorExists] = await db.execute(checkSql, [doctorId]);

    if (doctorExists.length === 0) {
      return res
        .status(404)
        .json({ error: "Legen med den angitte ID-en ble ikke funnet" });
    }

    // Oppdater, hvis legen finnes
    const sql =
      "UPDATE doctors SET first_name = ?, last_name = ?, specialization = ?, availability_start = ?, availability_end = ? WHERE id = ?";
    await db.execute(sql, [
      firstName,
      lastName,
      specialization,
      availabilityStart,
      availabilityEnd,
      doctorId,
    ]);

    // Hent oppdatert informasjon om legen
    const selectSql = "SELECT * FROM doctors WHERE id = ?";
    const [updatedDoctor] = await db.execute(selectSql, [doctorId]);

    // Oppdater ledige timeavtaler i databasen med legens nye tilgjengelighet
    await updateDoctorAppointmentSlots(updatedDoctor[0]);

    res.status(200).json({ message: "Lege oppdatert" });
  } catch (error) {
    console.error("Kunne ikke oppdatere info om lege", error);
    res.status(500).json({ error: "Feil ved oppdatering av data" });
  }
};

// --------------- Oppdater ledige avtaletimer i database ---------------//
const updateDoctorAppointmentSlots = async (doctor) => {
  try {
    // Slett gamle slots som ikke er booket
    await deleteOldSlots(doctor.id);

    // Generer nye slots basert på den nye tilgjengeligheten
    await generateNewSlots(
      doctor.id,
      doctor.availability_start,
      doctor.availability_end
    );

    console.log(
      `Nye ledige avtaler til lege med ID: ${doctor.id} er oppdatert`
    );
  } catch (error) {
    console.error("Feil ved oppdatering av ledige avtaler i databasen:", error);
  }
};

// --------------- Slett lege ---------------//
export const deleteDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const sql = "DELETE FROM doctors WHERE id = ?";
    const [result] = await db.execute(sql, [doctorId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Lege ikke funnet" });
    } else {
      res.status(200).json({ message: "Lege slettet" });
    }
  } catch (error) {
    console.error("Kunne ikke slette lege", error);
    res.status(500).json({ error: "Feil ved sletting av data" });
  }
};
