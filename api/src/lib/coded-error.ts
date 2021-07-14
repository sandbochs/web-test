type CodedErrorParams = {
  code: number, // error code
  status: number, // http status code
  message: string, // error message
}

export class CodedError extends Error {
  code: number;
  message: string;
  status: number;

  constructor(params: CodedErrorParams) {
    super();

    this.code = params.code;
    this.message = params.message;
    this.status = params.status;
  }
}

export const errors = {
  // Generic API errors
  api: {
    INTERNAL_ERROR: { code: 500, status: 500, message: 'Internal Server Error' },
    INVALID_TIME: { code: 600, status: 400, message: `'time' must be a ISO-8601 date string formatted as HH:MM` },
  },

  // Inventory Specific Errors
  inventory: {
    INVALID_INTERVAL: { code: 1000, status: 400, message: 'Invalid time, reservations can only be accepted in 15 minute intervals' },
    ALREADY_EXISTS: { code: 1001, status: 400, message: 'Inventory already exists for the specified time and party size' },
    MISSING_PARAMS: { code: 1002, status: 400, message: `'time', 'maxSize' and 'maxParties' must be provided` },
    INVALID_MAX_SIZE: { code: 1003, status: 400, message: `'maxSize' must be a number` },
    INVALID_MAX_PARTIES: { code: 1004, status: 400, message: `'maxParties' must be a number` },
  }
}