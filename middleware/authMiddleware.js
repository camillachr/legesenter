import db from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Henter "authorization"-header

  if (!authHeader) {
    return res.status(401).send("Tilgang nektet");
  }

  const token = authHeader.split(" ")[1]; // Fjerner "Bearer"

  try {
    // Sjekk om tokenet er i svartelisten
    const sql = "SELECT * FROM token_blacklist WHERE token = ?";
    const [rows] = await db.execute(sql, [token]);

    if (rows.length > 0) {
      return res
        .status(401)
        .send("Du er logget ut. Vennligst logg inn på nytt.");
    }

    // Verifiser token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error(err);
    res.status(400).send("Ugyldig token");
  }
};

export default authMiddleware;
