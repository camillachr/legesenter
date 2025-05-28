import db from "../config/db.js";

const validateAppointmentOwnership = async (req, res, next) => {
  const { appointmentId } = req.params;

  try {
    const sqlCheck = "SELECT user_id FROM appointments WHERE id = ?";
    const [rows] = await db.execute(sqlCheck, [appointmentId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Avtalen ble ikke funnet" });
    }

    const appointmentOwnerId = rows[0].user_id;

    if (appointmentOwnerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Du har ikke tilgang til denne avtalen" });
    }

    next();
  } catch (err) {
    console.error("Feil ved validering", err);
    res.status(400).send("Serverfeil ved validering");
  }
};

export default validateAppointmentOwnership;
