import db from "../config/db.js";

// --------------- Hent tilgjengelige legetimer ---------------//
export const getAvailableAppointments = async (req, res) => {
  try {
    // Hent alle ledige timer
    const [availableAppointments] = await db.execute(
      "SELECT a.id, a.doctor_id, a.appointment_date, a.start_time, a.end_time, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization FROM appointments a JOIN doctors d ON a.doctor_id = d.id  WHERE a.appointment_status = 'ledig'"
    );

    res.status(200).json(availableAppointments);
  } catch (error) {
    console.error("Kunne ikke hente ledige timer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------- Bestiller en time for innlogget bruker ---------------//
export const scheduleNewAppointment = async (req, res) => {
  const { doctorId, appointmentDate, startTime, endTime, message } = req.body;

  if (!doctorId || !appointmentDate || !startTime || !endTime || !message) {
    return res.status(400).json({ message: "Alle felter må fylles ut" });
  }

  try {
    // Sjekker om timen er ledig
    const conflictingAppointment = await checkForConflict(
      doctorId,
      appointmentDate,
      startTime
    );
    if (conflictingAppointment) {
      return res.status(409).json({
        message: "Timen er allerede booket eller ikke ledig",
      });
    }

    // Booker timen hvis ledig
    const sql = `
      INSERT INTO appointments (user_id, doctor_id, appointment_date, start_time, end_time, message, appointment_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(sql, [
      req.user.id,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      message,
      "booket",
    ]);

    res.status(201).json({ message: "Time bestilt" });
  } catch (error) {
    console.error("Feil ved bestilling av time:", error);
    res.status(500).json({ message: "Serverfeil ved bestilling av time" });
  }
};

// --------------- Sjekker om det finnes en time allerede ---------------//
const checkForConflict = async (doctorId, appointmentDate, startTime) => {
  // Sjekk om timen er ledig
  const checkSql = `
      SELECT * FROM appointments 
      WHERE doctor_id = ? AND appointment_date = ? AND start_time = ? AND appointment_status = ?
    `;
  const [conflictingAppointment] = await db.execute(checkSql, [
    doctorId,
    appointmentDate,
    startTime,
    "booket",
  ]);

  if (conflictingAppointment.length > 0) {
    return conflictingAppointment;
  }
};

// --------------- Hent brukerens bestilte timer ---------------//
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).send("Tilgang nektet");
    }

    const sql =
      "SELECT appointments.*, doctors.first_name AS doctor_first_name, doctors.last_name AS doctor_last_name, doctors.specialization FROM appointments JOIN doctors ON appointments.doctor_id = doctors.id WHERE appointments.user_id = ?";
    const [appointments] = await db.execute(sql, [userId]);

    if (appointments.length === 0) {
      return res.status(404).send("Ingen bestilte timer funnet");
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Feil ved henting av bestilte timer:", error);
    res
      .status(500)
      .json({ message: "Serverfeil ved henting av bestilte timer" });
  }
};

// --------------- Endre en eksisterende legetime for innlogget bruker ---------------//
export const changeAppointmentTimeAndDate = async (req, res) => {
  const { appointmentId } = req.params;
  const { newDate, newStartTime, newEndTime } = req.body;

  if (!newDate || !newStartTime || !newEndTime) {
    return res.status(400).json({ message: "Både dato og tid må fylles ut" });
  }

  try {
    // Hent legetimen som skal endres
    const sqlGetAppointment =
      "SELECT * FROM appointments WHERE id = ? AND user_id = ?";
    const [appointmentToChange] = await db.execute(sqlGetAppointment, [
      appointmentId,
      req.user.id,
    ]);

    if (appointmentToChange.length === 0) {
      return res.status(404).json({ message: "Ingen time funnet for å endre" });
    }

    const doctorId = appointmentToChange[0].doctor_id;

    // Sjekker om timen er ledig
    const conflictingAppointment = await checkForConflict(
      doctorId,
      newDate,
      newStartTime
    );
    if (conflictingAppointment) {
      return res.status(409).json({
        message: "Timen er allerede booket eller ikke ledig",
      });
    }

    // Hvis tidspunktet er ledig, oppdater dato og tidspunkt for legetimen
    const sqlUpdate =
      "UPDATE appointments SET appointment_date = ?, start_time = ?, end_time = ? WHERE id = ? AND user_id = ?";
    await db.execute(sqlUpdate, [
      newDate,
      newStartTime,
      newEndTime,
      appointmentId,
      req.user.id,
    ]);

    res.status(200).json({ message: "Timen ble endret" });
  } catch (error) {
    console.error("Feil ved endring av time:", error);
    res.status(500).json({ message: "Serverfeil ved endring av time" });
  }
};

// --------------- Kanseller en legetime for innlogget bruker ---------------//
export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const sql = "DELETE FROM appointments WHERE id = ? AND user_id =?";
    const [result] = await db.execute(sql, [appointmentId, req.user.id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Timen ble ikke funnet" });
    } else {
      res.status(200).json({ message: "Timen ble slettet" });
    }
  } catch (error) {
    console.error("Feil ved sletting av time", error);
    res.status(500).json({ error: "Feil ved sletting av time" });
  }
};

// --------------- Henter alle timeavtaler (for admin) ---------------//
export const getAllAppointments = async (req, res) => {
  console.log("Inne i getAllAppointments");
  const sql =
    "SELECT appointments.*, doctors.first_name AS doctor_first_name, doctors.last_name AS doctor_last_name, doctors.specialization FROM appointments JOIN doctors ON appointments.doctor_id = doctors.id WHERE appointments.appointment_status = 'booket'";

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error("Feil ved henting av data:", error);
    res.status(500).json({ error: "Feil ved henting av data" });
  }
};
