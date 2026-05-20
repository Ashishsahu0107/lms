export class AppError extends Error {
  constructor(message, { statusCode = 500, details } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message, details) {
    super(message, { statusCode: 400, details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message, details) {
    super(message, { statusCode: 401, details });
  }
}

export class NotFoundError extends AppError {
  constructor(message, details) {
    super(message, { statusCode: 404, details });
  }
}

