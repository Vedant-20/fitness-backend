const ApiError = (res, statusCode, message, errors = []) => {
  res.status(statusCode).json({ message, errors });
};

export { ApiError };
