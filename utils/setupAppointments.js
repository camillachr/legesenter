import db from "../config/db.js";

// --------------- Generer ledige avtaletimer for alle leger ---------------//
export const setupAppointmentsForAllDoctors = async () => {
  try {
    // Hent alle legene fra databasen
    const sqlDoctors = "SELECT * FROM doctors";
    const [doctors] = await db.execute(sqlDoctors);

    for (let doctor of doctors) {
      // Slett gamle slots som ikke er booket
      await deleteOldSlots(doctor.id);

      // Generer nye slots for legen
      await generateNewSlots(
        doctor.id,
        doctor.availability_start,
        doctor.availability_end
      );
    }
    console.log("Nye avtaletimer er opprettet for alle leger");
  } catch (error) {
    console.error("Feil ved oppretting av avtaletimer for leger:", error);
  }
};

// --------------- Sletter gamle ledige avtaletimer ---------------//
export const deleteOldSlots = async (doctorId) => {
  try {
    const sql =
      "DELETE FROM appointments WHERE doctor_id = ? AND appointment_status = 'ledig'";
    await db.execute(sql, [doctorId]);

    console.log(
      `Slettet gamle ledige avtaletimer for lege med ID: ${doctorId}`
    );
  } catch (error) {
    console.error("Feil ved sletting av gamle slots:", error);
  }
};

// --------------- Genererer nye ledige avtaletimer ---------------//
export const generateNewSlots = async (
  doctorId,
  doctorStartTime,
  doctorEndTime
) => {
  try {
    const daysToGenerate = getDates();
    let newAppointments = [];

    // For hver dag, sett opp avtaler hvert 15. minutt innenfor legens tilgjengelighet
    for (let day of daysToGenerate) {
      const dayString =
        day.getFullYear() +
        "-" +
        (day.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        day.getDate().toString().padStart(2, "0");

      // Hent start- og sluttid (timer, minutter) fra legens tilgjengelighet
      const [startHours, startMinutes] = doctorStartTime.split(":");
      const [endHours, endMinutes] = doctorEndTime.split(":");

      // Opprett start- og sluttidsobjekter for dagen
      let currentTime = new Date(day.setHours(startHours, startMinutes, 0, 0));
      const endTime = new Date(day.setHours(endHours, endMinutes, 0, 0));

      // Sett opp starttid og en sluttid 15 minutter senere
      while (currentTime < endTime) {
        const appointmentStart = new Date(currentTime);
        const appointmentEnd = new Date(
          currentTime.setMinutes(currentTime.getMinutes() + 15)
        );

        if (appointmentEnd > endTime) {
          break;
        }

        // Legg alle avtaletidspunktene inn i array
        newAppointments.push({
          doctorId: doctorId,
          appointmentDate: dayString,
          startTime: `${appointmentStart
            .getHours()
            .toString()
            .padStart(2, "0")}:${appointmentStart
            .getMinutes()
            .toString()
            .padStart(2, "0")}`, // "HH:MM" format
          endTime: `${appointmentEnd
            .getHours()
            .toString()
            .padStart(2, "0")}:${appointmentEnd
            .getMinutes()
            .toString()
            .padStart(2, "0")}`, // "HH:MM" format
          appointmentStatus: "ledig",
        });
      }
    }
    // Filtrer timeavtalene for å kryssjekke mot allerede bookede avtaler
    newAppointments = await filterBookedAppointments(newAppointments, doctorId);

    // Lagre de nye ledige timeavtalene i databasen
    insertNewAppointments(newAppointments);

    console.log(
      `Opprettet nye ledige avtaletimer for lege med ID: ${doctorId}`
    );
  } catch (error) {
    console.error("Feil ved opprettelse av nye avtaler:", error);
  }
};

// --------------- Kryssjekker mot bookede avtaler, unngår dobbelbooking ---------------//
export const filterBookedAppointments = async (newAppointments, doctorId) => {
  // Hent eksisterende bookede avtaler for denne legen
  const sqlBookedAppointments =
    "SELECT appointment_date, start_time FROM appointments WHERE doctor_id = ? AND appointment_status = 'booket'";
  const [bookedAppointments] = await db.execute(sqlBookedAppointments, [
    doctorId,
  ]);

  if (bookedAppointments.length === 0) {
    return newAppointments;
  }

  // Filtrer ut avtaletidspunkter som kolliderer med bookede timer
  return newAppointments.filter((appointment) => {
    const isBooked = bookedAppointments.some((booked) => {
      return (
        booked.appointment_date === appointment.appointmentDate &&
        booked.start_time === appointment.startTime
      );
    });
    return !isBooked;
  });
};

// --------------- Setter inn nye ledige avtaletimer i databasen ---------------//
export const insertNewAppointments = async (newAppointments) => {
  try {
    for (let appointment of newAppointments) {
      const insertSql = `
        INSERT INTO appointments (doctor_id, appointment_date, start_time, end_time, appointment_status)
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.execute(insertSql, [
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.startTime,
        appointment.endTime,
        appointment.appointmentStatus,
      ]);
    }
  } catch (error) {
    console.error("Feil ved oppdatering av nye avtaler:", error);
  }
};

// --------------- Henter de neste 5 virkedager ---------------//
const getDates = () => {
  const dates = [];
  const daysToGenerate = 5;
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1); // Start fra i morgen

  while (dates.length < daysToGenerate) {
    // Tar ikke med lørdag og søndag
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1); //Øker med en dag hver iterasjon
  }

  return dates;
};
