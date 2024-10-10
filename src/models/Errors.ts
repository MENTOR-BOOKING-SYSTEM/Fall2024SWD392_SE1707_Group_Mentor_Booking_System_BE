import HTTP_STATUS from '~/constants/httpStatus'
import { ERROR_MESSAGES, USERS_MESSAGES } from '~/constants/messages'

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
export class ErrorWithStatus<T = any> {
  message: string
  status: number
  data?: T
  constructor({ message, status, data }: { message: string; status: number; data?: T }) {
    this.message = message
    this.status = status
    if (data) {
      this.data = data
    }
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}

export class AuthError extends ErrorWithStatus {
  constructor({ message = ERROR_MESSAGES.UNAUTHORIZED } = {}) {
    super({ message, status: HTTP_STATUS.UNAUTHORIZED })
  }
}

export class NotFoundError extends ErrorWithStatus {
  constructor({ message = ERROR_MESSAGES.NOT_FOUND } = {}) {
    super({ message, status: HTTP_STATUS.NOT_FOUND })
  }
}

export class ForbiddenError extends ErrorWithStatus {
  constructor({ message = ERROR_MESSAGES.FORBIDDEN } = {}) {
    super({ message, status: HTTP_STATUS.FORBIDDEN })
  }
}

export class BadRequestError extends ErrorWithStatus {
  constructor({ message = ERROR_MESSAGES.BAD_REQUEST } = {}) {
    super({ message, status: HTTP_STATUS.BAD_REQUEST })
  }
}

export class ConflictError extends ErrorWithStatus {
  constructor({ message = ERROR_MESSAGES.CONFLICT } = {}) {
    super({ message, status: HTTP_STATUS.CONFLICT })
  }
}
