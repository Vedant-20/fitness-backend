const ApiResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json({ data, message });
};

export { ApiResponse };
