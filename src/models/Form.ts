import databaseService from '~/services/database.services'
import User from './schemas/User.schema'
import { ParamSchema } from 'express-validator'
import { ERROR_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { verifyTokenByType } from '~/utils/commons'
import { NotFoundError } from './Errors'
import { Request } from 'express'

export const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
}

export const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG }
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

export const forgotPasswordSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      const decoded_forgot_password_token = await verifyTokenByType(value, 'forgot_password_token', req as Request)
      const [user] = await databaseService.query<User[]>(
        'SELECT email, forgotPasswordToken FROM User WHERE email = ?',
        [decoded_forgot_password_token.email]
      )
      if (!user.email) {
        throw new NotFoundError({ message: ERROR_MESSAGES.NOT_FOUND })
      }
      if (user.forgotPasswordToken !== value) {
        throw new Error(ERROR_MESSAGES.BAD_REQUEST)
      }
      return true
    }
  }
}
