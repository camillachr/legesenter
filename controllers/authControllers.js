import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import isEmail from "validator/lib/isEmail.js";

// --------------- Registrer ny bruker ---------------//
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("Alle felter må fylles ut");
  }

  // Valider at e-postadressen har riktig format med validator
  if (!isEmail(email)) {
    return res.status(400).send("Ugyldig e-postadresse");
  }

  try {
    //Sjekk om epostadressen allerede eksisterer
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Denne epostadressen er allerede knyttet til en bruker",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = "patient";

    await db.query(
      "INSERT INTO users (first_name, last_name, email, password_hash, role_type) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, userRole]
    );
    res.status(200).json({ message: "Brukeren ble registrert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverfeil" });
  }
};

// --------------- Logg inn ---------------//
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Både epost og passord må fylles ut");
  }

  try {
    // Autentiser bruker
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).send("Feil epostadresse eller passord");
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).send("Feil brukernavn eller passord");
    }

    // Access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role_type },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", //Burde vært kortere, men har den på en time for at det skal være enklere å teste
      }
    );

    res.status(200).json({
      message: "Innlogging vellykket",
      token: accessToken,
    });
  } catch (error) {
    console.error("Feil under innlogging:", error);
    res.status(500).json({ message: "Serverfeil" });
  }
};

// --------------- Logg ut ---------------//
export const userLogout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader.split(" ")[1];
    console.log(token);

    // Legg token i blacklist
    const sql = "INSERT INTO token_blacklist (token) VALUES (?)";
    await db.execute(sql, [token]);

    res.send("Du er logget ut");
  } catch (error) {
    console.error("Feil under utlogging:", error);
    res.status(500).json({ message: "Serverfeil" });
  }
};
