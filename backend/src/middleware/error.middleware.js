const errorHandler = (err, req, res, next) => {
  console.error("Unhandled request error", {
    code: err.name || "Error",
    method: req.method,
    path: req.originalUrl,
    status: err.status || 500
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.publicMessage || "Internal Server Error"
  });
};

export default errorHandler;
