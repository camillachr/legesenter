import bcrypt from "bcryptjs";
import db from "../config/db.js";

const createAdminUser = async () => {
  try {
    // Opprett adminbruker hvis det ikke allerede finnes en
    const [existingAdmins] = await db.query(
      "SELECT * FROM users WHERE role_type = 'admin'"
    );

    if (existingAdmins.length > 0) {
      return;
    }

    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = {
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      password_hash: hashedPassword,
      role_type: "admin",
    };

    // Sett inn adminbruker i databasen
    const sql = `
      INSERT INTO users (first_name, last_name, email, password_hash, role_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      adminUser.first_name,
      adminUser.last_name,
      adminUser.email,
      adminUser.password_hash,
      adminUser.role_type,
    ]);

    console.log(
      "Adminbruker opprettet: E-post: admin@example.com, Passord: admin123"
    );
    console.log(`Adminbruker ID: ${result.insertId}`);
  } catch (error) {
    console.error("Feil ved opprettelse av adminbruker:", error);
  }
};

export default createAdminUser;
