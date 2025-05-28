const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .send("Tilgang nektet. Mangler nødvendige rettigheter.");
    }

    next();
  } catch (err) {
    console.error("Feil i adminMiddleware:", err);
    res.status(500).send("Serverfeil ved autorisasjon.");
  }
};

export default adminMiddleware;
