const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid case id format" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;