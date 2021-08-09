// enum HTTP_ERROR_CODES_ENUM {
//   BAD_REQUEST = 400,
//   UNAUTHORIZED = 401,
//   FORBIDDEN = 403,
//   NOT_FOUND = 404,
//   METHOD_NOT_ALLOWED = 405,
//   CONFLICT = 409,
//   UNPROCESSABLE_ENTITY = 422,
//   TOO_MANY_REQUESTS = 429,
//   INTERNAL_SERVER_ERROR = 500,
// }

interface ErrorParametersDTO {
  message: string;
  status_code?: number;
  code?: string;
}

export class AppError {
  public readonly message: string;

  public readonly status_code: number;

  public readonly code: string;

  constructor({ message, status_code = 400, code = '' }: ErrorParametersDTO) {
    this.message = message;
    this.status_code = status_code;
    this.code = code;
  }
}
