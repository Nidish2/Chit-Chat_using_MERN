const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // Set the status code to 404
  next(error); // Pass the error to the error handler middleware
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if status code is not set
  res.status(statusCode); // Set the status code
  res.json({
    message: error.message, // Send error message
    stack: process.env.NODE_ENV === "production" ? null : error.stack, // Conditionally show stack trace
  });
};

module.exports = { notFound, errorHandler };
